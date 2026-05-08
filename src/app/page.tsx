"use client";

import HeroSlider from "@/components/sections/HeroSlider";
import BreakingNews from "@/components/sections/BreakingNews";
import NoticeBoard from "@/components/sections/NoticeBoard";
import EventsGrid from "@/components/sections/EventsGrid";
import GalleryGrid from "@/components/sections/GalleryGrid";
import Testimonials from "@/components/sections/Testimonials";
import { useDynamicContent } from "@/hooks/useDynamicContent";

export default function Home() {
  const { heroSlides, events, galleryImages, testimonials, school } = useDynamicContent();

  return (
    <>
      <HeroSlider slides={heroSlides} motto={school.motto} />
      <BreakingNews />
      <NoticeBoard />
      <EventsGrid events={events} />
      <GalleryGrid images={galleryImages} />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
