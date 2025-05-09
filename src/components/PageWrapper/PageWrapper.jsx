"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Contesto per condividere lo stato di transizione con i figli
export const TransitionContext = createContext({
  isTransitioning: false,
  prevPathname: null,
  currentPathname: null
});

export function useTransition() {
  return useContext(TransitionContext);
}

export default function PageWrapper({ children }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      window.isPageTransitioning = isTransitioning;
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [isTransitioning]);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      console.log(`🔄 Navigazione: ${prevPathRef.current} -> ${pathname}`);
      setIsTransitioning(true);

      // 1. Blocca lo scroll
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.stop();
      }

      // 2. Termina tutte le animazioni GSAP
      gsap.killTweensOf("*");

      // 3. Elimina tutti gli ScrollTrigger attivi
      if (typeof window !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => {
          console.log(`🧹 Eliminazione trigger: ${trigger.vars.id || 'senza ID'}`);
          trigger.kill(true);
        });

        // 4. Elimina gli spacer pin lasciati da ScrollTrigger
        document.querySelectorAll('.gsap-pin-spacer').forEach(el => el.remove());

        // 5. Reset scroll (con rAF per evitare race condition)
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          if (window.lenis) {
            window.lenis.scrollTo(0, { immediate: true, force: true });
          }
        });
      }

      // 6. Aggiorna il pathname precedente
      prevPathRef.current = pathname;

      // 7. Ritardo prima di completare la transizione
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);

      transitionTimeoutRef.current = setTimeout(() => {
        if (typeof window !== 'undefined' && window.lenis) {
          window.lenis.start();
        }

        // 8. Refresh finale ScrollTrigger e dispatch evento
        if (typeof window !== 'undefined') {
          ScrollTrigger.refresh(true);
          console.log("✅ Transizione completata, ScrollTrigger refreshed");

          window.dispatchEvent(new CustomEvent('pageTransitionComplete', {
            detail: { pathname }
          }));
        }

        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      }, 300);
    }
  }, [pathname]);

  const pageKey = `page-${pathname}`;

  const transitionContext = {
    isTransitioning,
    prevPathname: prevPathRef.current,
    currentPathname: pathname
  };

  return (
    <TransitionContext.Provider value={transitionContext}>
      <div
        className="page-wrapper"
        key={pageKey}
        data-transitioning={isTransitioning}
        onTransitionEnd={() => {
          if (typeof window !== 'undefined') {
            ScrollTrigger.refresh(true);
          }
        }}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
}