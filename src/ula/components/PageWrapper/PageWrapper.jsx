// src/components/PageWrapper.jsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function PageWrapper({ children }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Register ScrollTrigger on client side
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Se il pathname è cambiato
    if (prevPathRef.current !== pathname) {
      console.log(`Navigazione: ${prevPathRef.current} -> ${pathname}`);

      // Pulizia dei trigger
      if (typeof window !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => {
          trigger.kill();
        });
      }

      // Reset delle posizioni
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }

      // Aggiorna il pathname precedente
      prevPathRef.current = pathname;

      // Refresh dopo un breve ritardo
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          ScrollTrigger.refresh(true);
        }, 200);
      }
    }
  }, [pathname]);

  // Generate a unique key based on pathname to force remount
  const pageKey = `page-${pathname}`;

  // Use the key to force remount of children
  return (
    <div className="page-wrapper" key={pageKey}>
      {children}
    </div>
  );
}