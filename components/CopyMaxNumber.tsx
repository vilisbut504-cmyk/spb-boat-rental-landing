"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Canonical number to copy, e.g. "+79112526969" */
  number: string;
  className?: string;
};

/**
 * MAX has no confirmed profile URL, so we never link anywhere —
 * we only copy the number. Falls back to a hidden textarea when the
 * Clipboard API is unavailable (http, older WebViews).
 */
export function CopyMaxNumber({ number, className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(number);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      const ta = document.createElement("textarea");
      ta.value = number;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (ok) {
      setCopied(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Скопировать номер MAX ${number}`}
      className={className}
    >
      {copied ? "Номер скопирован" : "Скопировать номер"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Номер скопирован" : ""}
      </span>
    </button>
  );
}
