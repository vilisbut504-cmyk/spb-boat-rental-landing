"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { PhoneIcon } from "@/components/SocialIcons";

/**
 * Fixed call affordance — tel: link only (not WhatsApp / MAX / booking form).
 * Hides when menu, lightbox or other aria-modal overlays are open.
 */
export function FloatingCallButton() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const check = () => {
      const modalOpen = Boolean(document.querySelector('[aria-modal="true"]'));
      const menuOpen = document.body.dataset.menuOpen === "true";
      setHidden(modalOpen || menuOpen);
    };

    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["style", "class", "aria-modal", "data-menu-open"],
    });
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <a
      href={site.phoneHref}
      aria-label={site.phoneAriaLabel}
      className="floating-call-btn fixed z-[45] inline-flex items-center justify-center gap-2 rounded-full bg-marine-600 text-white shadow-[0_12px_28px_-8px_rgba(12,58,90,0.55)] ring-1 ring-white/20 transition-colors hover:bg-marine-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marine-500 bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] h-14 w-14 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:px-5 sm:py-3.5"
    >
      <PhoneIcon className="h-6 w-6 sm:h-5 sm:w-5" />
      <span className="hidden text-sm font-semibold sm:inline">Позвонить</span>
    </a>
  );
}
