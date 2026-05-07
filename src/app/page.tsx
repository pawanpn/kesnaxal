import HeroSlider from "@/components/sections/HeroSlider";
import BreakingNews from "@/components/sections/BreakingNews";
import NoticeBoard from "@/components/sections/NoticeBoard";
import EventsGrid from "@/components/sections/EventsGrid";
import GalleryGrid from "@/components/sections/GalleryGrid";
import Testimonials from "@/components/sections/Testimonials";
import { siteConfig } from "@/constants/siteConfig";

export default function Home() {
  return (
    <>
      <HeroSlider slides={siteConfig.hero.slides} motto={siteConfig.school.motto} />
      <BreakingNews />
      <NoticeBoard />
      <EventsGrid events={siteConfig.upcomingEvents} />
      <GalleryGrid images={siteConfig.gallery.images} />
      <Testimonials testimonials={siteConfig.testimonials} />
    </>
  );
}
