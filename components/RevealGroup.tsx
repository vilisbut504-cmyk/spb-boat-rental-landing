"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Progressive-enhancement reveal:
 * - Content is visible by default (CSS opacity: 1 always).
 * - On desktop with motion allowed, a gentle translateY eases in when
 *   the group enters the viewport — never hides content with opacity.
 * - Fail-safe timer ensures is-visible even if IO never fires.
 * - Mobile / reduced-motion / missing IO → no JS dependency for visibility.
 */
export function RevealGroup({ className = "", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [enhance, setEnhance] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const canObserve = typeof IntersectionObserver !== "undefined";

    // Mobile / reduced motion: leave enhance off — CSS keeps everything opaque.
    if (prefersReduced || !isDesktop || !canObserve) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- progressive-enhancement flag after mount
    setEnhance(true);

    const failSafe = window.setTimeout(() => {
      setVisible(true);
    }, 1200);

    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            window.clearTimeout(failSafe);
            io?.disconnect();
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
      );
      io.observe(el);
    } catch {
      setVisible(true);
      window.clearTimeout(failSafe);
    }

    return () => {
      window.clearTimeout(failSafe);
      io?.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-group ${enhance ? "reveal-js" : ""} ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
