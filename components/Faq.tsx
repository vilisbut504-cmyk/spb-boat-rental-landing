"use client";

import { useState } from "react";
import { faq } from "@/data/faq";
import { SectionHeading } from "@/components/SectionHeading";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Частые вопросы"
          subtitle="Если не нашли ответ — напишите менеджеру, поможем разобраться."
          center
        />

        <div className="mt-10 space-y-3">
          {faq.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-marine-100 bg-milk"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-ink">{item.question}</span>
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full bg-marine-50 text-marine-600 transition-transform ${
                      open ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
