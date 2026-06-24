import { NextResponse } from "next/server";

export type LeadPayload = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  boatName?: string;
  routeName?: string;
  route?: string;
  format: string;
  comment?: string;
};

const SUCCESS_MESSAGE =
  "Заявка принята. Менеджер свяжется с вами, уточнит катер, маршрут, условия допуска и свободное время.";

const TEST_MODE_NOTE =
  "Сейчас заявка сохранена в тестовом режиме. Подключите LEADS_WEBHOOK_URL для отправки в CRM.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    const payload = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      date: body.date,
      time: body.time,
      guests: body.guests,
      boatName: body.boatName?.trim() || "",
      routeName: body.routeName?.trim() || body.route?.trim() || "",
      format: body.format,
      comment: body.comment?.trim() || "",
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
      message: SUCCESS_MESSAGE,
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
