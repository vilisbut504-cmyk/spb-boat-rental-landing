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

const SUCCESS_MESSAGE =
  "Заявка принята. Менеджер свяжется с вами, подтвердит катер, маршрут и свободное время, а также подскажет способ внесения предоплаты 1 000 ₽ в счёт прогулки.";

/**
 * Without LEADS_WEBHOOK_URL the lead is not delivered anywhere, so the
 * success text must not promise a manager callback.
 */
const TEST_MODE_MESSAGE =
  "Заявка сохранена в тестовом режиме. Приём заявок ещё настраивается — пожалуйста, свяжитесь с нами напрямую, чтобы подтвердить бронь.";

const TEST_MODE_NOTE =
  "Технически: заявка не доставлена менеджеру. Подключите LEADS_WEBHOOK_URL для реальной отправки.";

const CERT_SUCCESS_MESSAGE =
  "Заявка на сертификат отправлена. Менеджер свяжется с вами выбранным способом, подтвердит заказ и отправит реквизиты для оплаты.";

const CERT_TEST_MODE_MESSAGE =
  "Приём заявок через сайт пока настраивается. Чтобы оформить сертификат сейчас, пожалуйста, свяжитесь с нами напрямую.";

function badRequest(code: string, error: string) {
  return NextResponse.json({ ok: false, code, error }, { status: 400 });
}

async function deliver(payload: Record<string, unknown>) {
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

  // Structure is ready for the future CRM stage. Prices come only from
  // data/certificates.ts — the client-sent price (if any) is ignored.
  const payload = {
    leadType: "gift_certificate",
    format: certificateFormatName,
    name: body.name.trim(),
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
    receivedAt: new Date().toISOString(),
  };

  const result = await deliver(payload);
  if (result.delivered) {
    return NextResponse.json({
      ok: true,
      testMode: false,
      message: CERT_SUCCESS_MESSAGE,
    });
  }
  if ("failed" in result && result.failed) {
    return NextResponse.json(
      { ok: false, error: "Не удалось отправить заявку" },
      { status: 502 }
    );
  }

  console.log("[lead] certificate test mode", payload);
  return NextResponse.json({
    ok: true,
    testMode: true,
    message: CERT_TEST_MODE_MESSAGE,
    testModeNote: TEST_MODE_NOTE,
  });
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
    if (
      body.format === certificateFormatName ||
      body.certificateTariffId
    ) {
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

    const payload = {
      leadType: "boat_rental",
      name: body.name.trim(),
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
      receivedAt: new Date().toISOString(),
    };

    const result = await deliver(payload);
    if (result.delivered) {
      return NextResponse.json({
        ok: true,
        testMode: false,
        message: SUCCESS_MESSAGE,
      });
    }
    if ("failed" in result && result.failed) {
      return NextResponse.json(
        { ok: false, error: "Не удалось отправить заявку" },
        { status: 502 }
      );
    }

    console.log("[lead] test mode", payload);

    return NextResponse.json({
      ok: true,
      testMode: true,
      message: TEST_MODE_MESSAGE,
      testModeNote: TEST_MODE_NOTE,
    });
  } catch (err) {
    console.error("[lead] error", err);
    return NextResponse.json(
      { ok: false, error: "Не удалось обработать заявку" },
      { status: 500 }
    );
  }
}
