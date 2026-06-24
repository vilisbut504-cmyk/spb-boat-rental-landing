import { Hero } from "@/components/Hero";
import { Advantages } from "@/components/Advantages";
import { Scenarios } from "@/components/Scenarios";
import { Fleet } from "@/components/Fleet";
import { Routes } from "@/components/Routes";
import { Steps } from "@/components/Steps";
import { Safety } from "@/components/Safety";
import { Conditions } from "@/components/Conditions";
import { ContactStart } from "@/components/ContactStart";
import { Booking } from "@/components/Booking";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Advantages />
      <Scenarios />
      <Fleet />
      <Routes />
      <Steps />
      <Safety />
      <Conditions />
      <ContactStart />
      <Booking />
      <Faq />
      <FinalCta />
    </>
  );
}
