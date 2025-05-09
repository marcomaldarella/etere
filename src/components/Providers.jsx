"use client";

import { ContentProvider } from "@/context/ContentContext";
import { ReactLenis } from "@studio-freight/react-lenis";
import Navbar from "@/components/Navbar/Navbar";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function Providers({ children }) {
  const lenisRef = useRef();

  // Initialize GSAP and ScrollTrigger once
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Set up ScrollTrigger defaults
    ScrollTrigger.defaults({
      scroller: document.querySelector(".app"),
      markers: false,
    });

    return () => {
      // Clean up on unmount
      if (typeof window !== "undefined") {
        // Kill all ScrollTrigger instances
        ScrollTrigger.getAll().forEach(trigger => {
          trigger.kill();
        });

        // Destroy Lenis
        if (lenisRef.current) {
          lenisRef.current.destroy();
        }
      }
    };
  }, []);

  return (
    <ContentProvider>
      <ReactLenis
        ref={lenisRef}
        root
        className="app"
        options={{
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 1.5,
        }}
      >
        <Navbar />
        {children}
      </ReactLenis>
    </ContentProvider>
  );
}
