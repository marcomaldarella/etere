<<<<<<< HEAD
"use client";
import { useRef, useLayoutEffect, useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ReactLenis, useLenis } from "@studio-freight/react-lenis";

import Hero from "@/components/Hero/Hero";
import Services from "@/components/Services/Services";
import Carousel from "@/components/Carousel/Carousel";
import FinalHero from "@/components/FinalHero/FinalHero";
import Footer from "@/components/Footer/Footer";
import ProjectsSlider from "@/components/ProjectsSlider/ProjectsSlider";
import { useContent } from "@/context/ContentContext";
import { usePageTransition } from "@/hooks/usePageTransition";
import "./home.css";

// Only register the plugin on the client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePageWrapper() {
  const pathname = usePathname();
  const pageKey = usePageTransition();

  return <Home key={pageKey} pathname={pathname} />;
}

function Home({ pathname }) {
  const containerRef = useRef(null);
  const lenis = useLenis();
  const { home } = useContent();

  useEffect(() => {
    if (!lenis) return;
    requestAnimationFrame(() => {
      lenis.scrollTo(0, { immediate: true, force: true });
    });
  }, [lenis, pathname]);

  useLayoutEffect(() => {
    if (!lenis || !containerRef.current || typeof window === "undefined") return;

    // Set up Lenis scroll integration with GSAP for non-pinned sections
    ScrollTrigger.scrollerProxy(containerRef.current, {
      scrollTop(v) {
        return arguments.length
          ? lenis.scrollTo(v, { immediate: true })
          : lenis.scroll;
      },
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      }),
      pinType: containerRef.current.style.transform ? "transform" : "fixed",
    });

    // Connect Lenis scroll to ScrollTrigger.update
    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", handleLenisScroll);
    ScrollTrigger.addEventListener("refreshInit", () => lenis.stop());
    ScrollTrigger.addEventListener("refresh", () => lenis.start());

    // Force refresh after mounting
    setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 200);

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.scrollerProxy(containerRef.current, null);
      lenis.off("scroll", handleLenisScroll);
    };
  }, [lenis]);

  return (
    <div className="app" ref={containerRef}>
      <Hero key={`hero-${pathname}`} />
      <Services />
      <ProjectsSlider />
      <Carousel key={`carousel-${pathname}`} />
      <FinalHero />
      <Footer />
=======
export default function Home() {
  return (
    <div className="app">
      <h1>Your AI art portal</h1>
>>>>>>> 20637ed (cleanup)
    </div>
  );
}
