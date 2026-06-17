"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function RevealGroup({ className = "", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-group ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
