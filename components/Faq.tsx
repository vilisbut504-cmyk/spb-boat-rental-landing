"use client";

import { useState } from "react";
import { faq } from "@/data/faq";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
            Вопросы и ответы
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Частые вопросы
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faq.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-xl border border-navy-100 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-navy-900">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-full bg-navy-50 text-navy-700 transition-transform ${
                      open ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{
                    gridTemplateRows: open ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-navy-800/70">
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
