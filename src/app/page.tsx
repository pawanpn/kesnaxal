import Hero from "@/components/Hero";
import BreakingNews from "@/components/BreakingNews";
import NoticeBoard from "@/components/NoticeBoard";
import UpcomingEvents from "@/components/UpcomingEvents";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <BreakingNews />
      <NoticeBoard />
      <UpcomingEvents />
      <Gallery />
      <Testimonials />
    </>
  );
}
