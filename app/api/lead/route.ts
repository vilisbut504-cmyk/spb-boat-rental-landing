import { NextResponse } from "next/server";
import {
  prepaymentNote,
  certificateFormatName,
  certificateAmounts,
} from "@/data/content";
import { boats, bookableBoatNames } from "@/data/boats";
import { routeNames } from "@/data/routes";
import { normalizeRuPhone } from "@/lib/phone";

export type LeadPayload = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests?: string;
  people?: string;
  boatName?: string;
  routeName?: string;
  route?: string;
  format: string;
  certificateAmount?: string | number;
  comment?: string;
  prepaymentNote?: string;
  privacyAccepted?: boolean;
  rulesAccepted?: boolean;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    const phone = normalizeRuPhone(body.phone);
    if (!phone.ok) {
      return NextResponse.json(
        { ok: false, code: "INVALID_PHONE", error: phone.error },
        { status: 400 }
      );
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
        return NextResponse.json(
          {
            ok: false,
            code: "INVALID_GUEST_COUNT",
            error: boat
              ? `Катер ${boat.name} вмещает от 1 до ${boat.maxGuests} человек`
              : `Укажите количество гостей от 1 до ${maxGuests}`,
          },
          { status: 400 }
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

    // Gift certificate: amount must be one of the approved values.
    // For regular walk formats the amount must stay empty.
    const isCertificate = body.format === certificateFormatName;
    const certificateRaw = String(body.certificateAmount ?? "").trim();
    let certificateAmount = "";
    if (isCertificate) {
      const amount = Number(certificateRaw);
      if (!(certificateAmounts as readonly number[]).includes(amount)) {
        return NextResponse.json(
          {
            ok: false,
            code: "INVALID_CERTIFICATE_AMOUNT",
            error: "Номинал сертификата: 5 000, 10 000 или 15 000 ₽",
          },
          { status: 400 }
        );
      }
      certificateAmount = String(amount);
    } else if (certificateRaw) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_CERTIFICATE_AMOUNT",
          error:
            "Номинал сертификата указывается только для формата «Подарочный сертификат»",
        },
        { status: 400 }
      );
    }

    const payload = {
      name: body.name.trim(),
      phone: phone.canonical,
      date: body.date,
      time: body.time,
      guests: guestsRaw,
      boatName,
      routeName,
      format: body.format,
      certificateAmount,
      comment: body.comment?.trim() || "",
      prepaymentNote: body.prepaymentNote?.trim() || prepaymentNote,
      privacyAccepted: Boolean(body.privacyAccepted),
      rulesAccepted: Boolean(body.rulesAccepted),
      receivedAt: new Date().toISOString(),
    };

    const webhookUrl = process.env.LEADS_WEBHOOK_URL;

    if (webhookUrl) {
      const webhookRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!webhookRes.ok) {
        console.error("[lead] webhook failed", webhookRes.status);
        return NextResponse.json(
          { ok: false, error: "Не удалось отправить заявку" },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ok: true,
        testMode: false,
        message: SUCCESS_MESSAGE,
      });
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
