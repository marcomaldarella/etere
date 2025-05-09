"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function ScrollReset() {
  const pathname = usePathname();
  const isInitialMount = useRef(true);
  const isNavigating = useRef(false);
  const previousPathname = useRef("");

  useEffect(() => {
    // Registra ScrollTrigger
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Skip the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousPathname.current = pathname;
      return;
    }

    // Don't reset on hash changes within the same page
    if (previousPathname.current.split('#')[0] === pathname.split('#')[0]) {
      previousPathname.current = pathname;
      return;
    }

    // Prevent multiple navigations from running simultaneously
    if (isNavigating.current) return;
    isNavigating.current = true;

    console.log(`ScrollReset: ${previousPathname.current} -> ${pathname}`);

    const handleNavigation = () => {
      if (typeof window !== "undefined") {
        try {
          console.log("ScrollReset: Riavvio ScrollTrigger");

          // Pulisci ScrollTrigger
          ScrollTrigger.getAll().forEach(trigger => trigger.kill());

          if (ScrollTrigger.clearScrollMemory) {
            ScrollTrigger.clearScrollMemory();
          }

          // Forza immediato scroll a 0
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }

          // Reset navigation state
          isNavigating.current = false;
          previousPathname.current = pathname;

          // Refresh ScrollTrigger
          setTimeout(() => {
            if (typeof window !== "undefined") {
              ScrollTrigger.refresh();
            }
          }, 100);

          console.log("ScrollReset completato");
        } catch (error) {
          console.error("Errore in ScrollReset:", error);
          isNavigating.current = false;
          previousPathname.current = pathname;
        }
      }
    };

    // Eseguire con requestAnimationFrame per garantire che il DOM sia pronto
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        handleNavigation();
      });
    }
  }, [pathname]);

  return null;
}
