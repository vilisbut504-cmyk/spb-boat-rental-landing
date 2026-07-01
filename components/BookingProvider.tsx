"use client";

import { createContext, useContext, useState, useCallback } from "react";

type BookingScrollOptions = {
  boatName?: string;
  routeName?: string;
};

type BookingContextValue = {
  selectedBoat: string;
  selectedRoute: string;
  setSelectedBoat: (name: string) => void;
  setSelectedRoute: (name: string) => void;
  scrollToBooking: (options?: BookingScrollOptions) => void;
  scrollToTariffs: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [selectedBoat, setSelectedBoat] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");

  const scrollToBooking = useCallback((options?: BookingScrollOptions) => {
    if (options?.boatName) setSelectedBoat(options.boatName);
    if (options?.routeName) setSelectedRoute(options.routeName);
    const el = document.getElementById("booking");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToTariffs = useCallback(() => {
    const el = document.getElementById("tariffs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <BookingContext.Provider
      value={{
        selectedBoat,
        selectedRoute,
        setSelectedBoat,
        setSelectedRoute,
        scrollToBooking,
        scrollToTariffs,
      }}
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
