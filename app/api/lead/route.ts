import { NextResponse } from "next/server";

export type LeadPayload = {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  boatName?: string;
  route?: string;
  format: string;
  comment?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;

    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    // Тестовый режим: логируем заявку. Для боевого запуска подключите Telegram / CRM / почту.
    console.log("[lead]", {
      ...body,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message:
        "Заявка принята в тестовом режиме. Для боевого запуска подключите Telegram, CRM или почту в API-обработчике.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Не удалось обработать заявку" },
      { status: 500 }
    );
  }
}
