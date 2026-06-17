import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Fleet } from "@/components/Fleet";
import { Routes } from "@/components/Routes";
import { Steps } from "@/components/Steps";
import { Faq } from "@/components/Faq";
import { Booking } from "@/components/Booking";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Fleet />
      <Routes />
      <Steps />
      <Booking />
      <Faq />
    </>
  );
}
