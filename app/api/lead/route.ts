import { NextResponse } from "next/server";
import { prepaymentNote } from "@/data/content";
import { boats, bookableBoatNames } from "@/data/boats";
import { routeNames } from "@/data/routes";
import {
  getCertificateTariff,
  certificateFormatName,
  certificateContactMethods,
  certificateContactMethodIds,
} from "@/data/certificates";
import { normalizeRuPhone } from "@/lib/phone";
import { site } from "@/data/site";
import {
  AMOCRM_NOT_CONFIGURED_MESSAGE,
  AMOCRM_SUCCESS_MESSAGE,
  createLeadInAmoCrm,
  isAmoCrmConfigured,
} from "@/lib/amocrm";

export type LeadPayload = {
  leadType?: string;
  name: string;
  phone: string;
  date?: string;
  time?: string;
  guests?: string;
  people?: string;
  boatName?: string;
  routeName?: string;
  route?: string;
  format?: string;
  comment?: string;
  prepaymentNote?: string;
  privacyAccepted?: boolean;
  rulesAccepted?: boolean;
  // gift certificate lead
  certificateTariffId?: string;
  preferredContact?: string;
  telegramUsername?: string;
  privacyConsent?: boolean;
  certificateConsent?: boolean;
};

/** Largest capacity in the fleet — the limit when no boat is chosen yet */
const DEFAULT_MAX_GUESTS = 5;

/**
 * Legacy webhook path — kept until amoCRM production is confirmed.
 * When AMOCRM_* is configured, amoCRM is the primary delivery channel.
 */
const WEBHOOK_SUCCESS_MESSAGE =
  "Заявка принята. Менеджер свяжется с вами, подтвердит катер, маршрут и свободное время, а также подскажет способ внесения предоплаты 1 000 ₽ в счёт прогулки.";

const CERT_WEBHOOK_SUCCESS_MESSAGE =
  "Заявка на сертификат отправлена. Менеджер свяжется с вами выбранным способом, подтвердит заказ и отправит реквизиты для оплаты.";

const CONTACT_HINT = {
  phoneDisplay: site.phoneDisplay,
  phoneHref: site.phoneHref,
  telegramUrl: site.telegramUrl,
  telegramUsername: site.telegramUsername,
  whatsappUrl: site.whatsappUrl,
  whatsappDisplay: site.whatsappDisplay,
};

function badRequest(code: string, error: string) {
  return NextResponse.json({ ok: false, code, error }, { status: 400 });
}

function notConfiguredResponse(message = AMOCRM_NOT_CONFIGURED_MESSAGE) {
  return NextResponse.json({
    ok: true,
    testMode: true,
    delivered: false,
    message,
    contacts: CONTACT_HINT,
  });
}

async function deliverWebhook(payload: Record<string, unknown>) {
  const webhookUrl = process.env.LEADS_WEBHOOK_URL;
  if (!webhookUrl) return { delivered: false as const };

  const webhookRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!webhookRes.ok) {
    console.error("[lead] webhook failed", webhookRes.status);
    return { delivered: false as const, failed: true as const };
  }
  return { delivered: true as const };
}

async function deliverLead(
  amoInput: Parameters<typeof createLeadInAmoCrm>[0],
  webhookPayload: Record<string, unknown>,
  webhookSuccessMessage: string
) {
  if (isAmoCrmConfigured()) {
    const amo = await createLeadInAmoCrm(amoInput);
    if (amo.ok) {
      return NextResponse.json({
        ok: true,
        testMode: false,
        delivered: true,
        message: AMOCRM_SUCCESS_MESSAGE,
      });
    }
    if (amo.code === "NOT_CONFIGURED") {
      return notConfiguredResponse(amo.message);
    }
    return NextResponse.json(
      { ok: false, code: amo.code, error: amo.message, contacts: CONTACT_HINT },
      { status: amo.code === "RATE_LIMITED" ? 429 : 502 }
    );
  }

  const result = await deliverWebhook(webhookPayload);
  if (result.delivered) {
    return NextResponse.json({
      ok: true,
      testMode: false,
      delivered: true,
      message: webhookSuccessMessage,
    });
  }
  if ("failed" in result && result.failed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Не удалось отправить заявку. Пожалуйста, свяжитесь с нами напрямую.",
        contacts: CONTACT_HINT,
      },
      { status: 502 }
    );
  }

  return notConfiguredResponse();
}

/** Gift certificate lead — price is always resolved server-side by tariff id. */
async function handleCertificateLead(body: LeadPayload) {
  if (!body.name?.trim() || body.name.trim().length < 2) {
    return badRequest("INVALID_NAME", "Укажите имя");
  }

  const phone = normalizeRuPhone(body.phone ?? "");
  if (!phone.ok) {
    return badRequest("INVALID_PHONE", phone.error);
  }

  const tariff = getCertificateTariff(String(body.certificateTariffId ?? ""));
  if (!tariff) {
    return badRequest(
      "INVALID_CERTIFICATE_TARIFF",
      "Выберите сертификат из списка тарифов"
    );
  }

  const preferredContact = String(body.preferredContact ?? "");
  if (!certificateContactMethodIds.includes(preferredContact)) {
    return badRequest(
      "INVALID_CONTACT_METHOD",
      "Выберите способ связи: звонок, WhatsApp, Telegram или MAX"
    );
  }

  const telegramUsername = String(body.telegramUsername ?? "").trim();
  if (preferredContact === "telegram" && !telegramUsername) {
    return badRequest(
      "TELEGRAM_USERNAME_REQUIRED",
      "Укажите имя пользователя в Telegram"
    );
  }

  if (!body.privacyConsent || !body.certificateConsent) {
    return badRequest("CONSENT_REQUIRED", "Необходимо оба согласия");
  }

  const contactLabel =
    certificateContactMethods.find((m) => m.id === preferredContact)?.label ??
    preferredContact;

  const name = body.name.trim();
  const receivedAt = new Date().toISOString();

  const payload = {
    leadType: "gift_certificate",
    format: certificateFormatName,
    name,
    phone: phone.canonical,
    preferredContact,
    preferredContactLabel: contactLabel,
    telegramUsername: preferredContact === "telegram" ? telegramUsername : "",
    certificateTariffId: tariff.id,
    certificateDayType: tariff.dayType,
    certificateDayLabel: tariff.dayLabel,
    certificateDurationMinutes: tariff.durationMinutes,
    certificateDurationLabel: tariff.durationLabel,
    certificatePrice: tariff.price,
    certificateDisplayLabel: tariff.displayLabel,
    comment: body.comment?.trim() || "",
    privacyConsent: true,
    certificateConsent: true,
    receivedAt,
  };

  return deliverLead(
    {
      kind: "gift_certificate",
      name,
      phone: phone.canonical,
      certificateDisplayLabel: tariff.displayLabel,
      certificateDayLabel: tariff.dayLabel,
      certificateDurationLabel: tariff.durationLabel,
      certificatePriceLabel: tariff.priceLabel,
      preferredContactLabel: contactLabel,
      telegramUsername:
        preferredContact === "telegram" ? telegramUsername : undefined,
      comment: body.comment?.trim() || "",
      receivedAt,
    },
    payload,
    CERT_WEBHOOK_SUCCESS_MESSAGE
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;

    // Reject removed amount-based certificate fields without reintroducing
    // them into the public payload type.
    if (
      Object.keys(body as Record<string, unknown>).some((key) =>
        /^certificate.*amount$/i.test(key)
      )
    ) {
      return badRequest(
        "INVALID_CERTIFICATE_TARIFF",
        "Выберите сертификат по категории дней и продолжительности"
      );
    }

    if (body.leadType === "gift_certificate") {
      return await handleCertificateLead(body);
    }

    // Regular walk leads must not contain certificate selection fields.
    if (body.format === certificateFormatName || body.certificateTariffId) {
      return badRequest(
        "INVALID_CERTIFICATE_TARIFF",
        "Сертификаты оформляются на странице /certificates"
      );
    }

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    const phone = normalizeRuPhone(body.phone);
    if (!phone.ok) {
      return badRequest("INVALID_PHONE", phone.error);
    }

    const boatName = body.boatName?.trim() || "";
    if (boatName && !bookableBoatNames.includes(boatName)) {
      return NextResponse.json(
        { ok: false, error: "Выберите катер из доступного парка" },
        { status: 400 }
      );
    }

    // Guest count is validated against the structured boat capacity —
    // never trust client-side validation alone.
    const guestsRaw = String(body.guests ?? body.people ?? "").trim();
    if (guestsRaw) {
      const guests = Number(guestsRaw);
      const boat = boats.find((b) => b.name === boatName);
      const maxGuests = boat?.maxGuests ?? DEFAULT_MAX_GUESTS;
      if (!Number.isInteger(guests) || guests < 1 || guests > maxGuests) {
        return badRequest(
          "INVALID_GUEST_COUNT",
          boat
            ? `Катер ${boat.name} вмещает от 1 до ${boat.maxGuests} человек`
            : `Укажите количество гостей от 1 до ${maxGuests}`
        );
      }
    }

    const routeName = body.routeName?.trim() || body.route?.trim() || "";
    if (routeName && !routeNames.includes(routeName)) {
      return NextResponse.json(
        { ok: false, error: "Выберите маршрут из списка" },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const receivedAt = new Date().toISOString();

    const payload = {
      leadType: "boat_rental",
      name,
      phone: phone.canonical,
      date: body.date,
      time: body.time,
      guests: guestsRaw,
      boatName,
      routeName,
      format: body.format,
      comment: body.comment?.trim() || "",
      prepaymentNote: body.prepaymentNote?.trim() || prepaymentNote,
      privacyAccepted: Boolean(body.privacyAccepted),
      rulesAccepted: Boolean(body.rulesAccepted),
      receivedAt,
    };

    return deliverLead(
      {
        kind: "boat_rental",
        name,
        phone: phone.canonical,
        boatName,
        routeName,
        date: body.date,
        time: body.time,
        guests: guestsRaw,
        format: body.format,
        comment: body.comment?.trim() || "",
        receivedAt,
      },
      payload,
      WEBHOOK_SUCCESS_MESSAGE
    );
  } catch (err) {
    console.error("[lead] error", err instanceof Error ? err.name : "error");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Не удалось обработать заявку. Пожалуйста, свяжитесь с нами напрямую.",
        contacts: CONTACT_HINT,
      },
      { status: 500 }
    );
  }
}
