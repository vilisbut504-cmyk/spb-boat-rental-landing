"use client";

import { createContext, useContext, useState, useCallback } from "react";

type BookingContextValue = {
  selectedBoat: string;
  setSelectedBoat: (name: string) => void;
  scrollToBooking: (boatName?: string) => void;
  scrollToTariffs: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [selectedBoat, setSelectedBoat] = useState("");

  const scrollToBooking = useCallback((boatName?: string) => {
    if (boatName) setSelectedBoat(boatName);
    const el = document.getElementById("booking");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToTariffs = useCallback(() => {
    const el = document.getElementById("tariffs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <BookingContext.Provider
      value={{ selectedBoat, setSelectedBoat, scrollToBooking, scrollToTariffs }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return ctx;
}
