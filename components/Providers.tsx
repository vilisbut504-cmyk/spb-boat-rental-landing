"use client";

import { BookingProvider } from "@/components/BookingProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <BookingProvider>{children}</BookingProvider>;
}
