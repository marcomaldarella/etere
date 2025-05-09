"use client";

import { useLayoutEffect, useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Marquee from "@/components/Marquee/Marquee";
import { useContent } from "@/context/ContentContext";
import { usePathname } from "next/navigation";
import { useTransition } from "@/components/PageWrapper/PageWrapper";
import "./Hero.css";

const START = "polygon(37.5% 10%, 62.5% 10%, 62.5% 90%, 37.5% 90%)";
const MID = "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)";
const END = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

export default function Hero() {
  const { home } = useContent();
  const pathname = usePathname();
  const { isTransitioning } = useTransition();
  const [isActive, setIsActive] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  if (!home || !home.hero) return <div>Loading hero content...</div>;

  const { hero } = home;
  const heroRef = useRef(null);
  const txtBoxRef = useRef(null);
  const animCtxRef = useRef(null);
  const isInitializedRef = useRef(false);
  const setupTimeoutRef = useRef(null);
  const scrollTriggerRef = useRef(null);

  const cleanup = () => {
    if (setupTimeoutRef.current) clearTimeout(setupTimeoutRef.current);
    setupTimeoutRef.current = null;

    // Kill ScrollTrigger instances
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
      scrollTriggerRef.current = null;
    }

    if (animCtxRef.current) {
      animCtxRef.current.revert();
      animCtxRef.current = null;
    }

    isInitializedRef.current = false;
  };

  // Listen for section activation events from PinSection
  useEffect(() => {
    const handleSectionActivated = (e) => {
      if (e.detail.id === 'hero') {
        console.log("🎬 Hero section activated");
        setIsActive(true);

        // Reset and reinitialize animations if requested
        if (e.detail.reset) {
          cleanup();
          setTimeout(() => {
            setupAnimations();
          }, 200);
        }
      } else {
        setIsActive(false);
      }
    };

    window.addEventListener('sectionActivated', handleSectionActivated);
    return () => {
      window.removeEventListener('sectionActivated', handleSectionActivated);
    };
  }, []);

  // Handle manual wheel events when section is active
  useEffect(() => {
    if (!isActive || !heroRef.current) return;

    const handleWheel = (e) => {
      // When animation is complete and scrolling down, signal section completion
      if (animationProgress > 0.95 && e.deltaY > 0) {
        window.dispatchEvent(new CustomEvent('sectionComplete', {
          detail: { id: 'hero', direction: 'down' }
        }));
      }
    };

    heroRef.current.addEventListener('wheel', handleWheel);
    return () => {
      if (heroRef.current) {
        heroRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isActive, animationProgress]);

  // Handle legacy events
  useEffect(() => {
    const handleSplashComplete = () => {
      console.log("🎇 Splash completed, re-initializing Hero");
      cleanup();
      setTimeout(() => {
        setupAnimations();
      }, 200);
    };

    window.addEventListener('splashCompleted', handleSplashComplete);

    return () => {
      window.removeEventListener('splashCompleted', handleSplashComplete);
    };
  }, []);

  useEffect(() => {
    const handleTransitionComplete = (e) => {
      if (e.detail.pathname === "/") {
        setupAnimations();
      }
    };
    window.addEventListener("pageTransitionComplete", handleTransitionComplete);
    return () => {
      window.removeEventListener("pageTransitionComplete", handleTransitionComplete);
    };
  }, []);

  useEffect(() => {
    cleanup();
    setupTimeoutRef.current = setTimeout(() => {
      setupAnimations();
    }, 100);
    return () => cleanup();
  }, [pathname]);

  const setupAnimations = () => {
    if (!heroRef.current || typeof window === "undefined" || isTransitioning) return;
    gsap.registerPlugin(ScrollTrigger);
    animCtxRef.current = gsap.context(() => {
      const el = heroRef.current;
      const titleEl = el.querySelector(".hero-title");
      if (titleEl) {
        titleEl.innerHTML = hero.title
          .split(" ")
          .map(word =>
            word.toLowerCase() === "unseen"
              ? `<span class="blur-word">${word}</span>`
              : `<span class="hero-line">${word}</span>`
          ).join(" ");
      }

      const mask = el.querySelector(".hero-img");
      const img = mask?.querySelector("video, img");
      const blur = el.querySelector(".blur-word");
      const lines = el.querySelectorAll(".hero-line");
      const txt = txtBoxRef.current;
      const cta = el.querySelector(".cta-button");
      const mq = el.querySelector(".marquee");
      const logos = el.querySelectorAll(".hero-logos img");

      if (!mask || !img || !blur || !lines.length || !txt || !cta || !mq || !logos.length) return;

      gsap.set(mq, { autoAlpha: 1 });
      gsap.set(mask, { "--clip": START, visibility: "visible", opacity: 0, scaleY: 0.95, y: 20 });
      mask.style.clipPath = "var(--clip)";
      gsap.set(img, { scale: 0.8 });

      gsap.set(blur, { filter: "blur(12px)" });

      gsap.set(lines, { autoAlpha: 0, y: 40 });
      gsap.set(txt, { autoAlpha: 0, y: 20 });
      gsap.set(cta, { autoAlpha: 0, scale: 0.8 });
      gsap.set(logos, { autoAlpha: 0, y: 30 });

      gsap.timeline()
        .to(mask, { opacity: 1, scaleY: 1, y: 0, duration: 2, ease: "power1.out" })
        .to(blur, {
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power2.out",
          force3D: true
        }, "<");

      // For PinSection, we'll use a timeline with a manual progress control
      // instead of scroll-triggered pinning
      const tl = gsap.timeline({
        paused: true,
        onUpdate: () => {
          // Track timeline progress for section completion
          setAnimationProgress(tl.progress());
        }
      });

      tl.to(mq, { autoAlpha: 0, ease: "power2.out" }, 0)
        .fromTo(mask, { "--clip": START }, { "--clip": MID, ease: "power2.inOut" }, 0)
        .to(img, {
          scale: 2.5,
          filter: "blur(40px)",
          transformOrigin: "center center",
          ease: "power2.out"
        }, 0)
        .to(txt, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.35)
        .to(mask, { "--clip": END, ease: "power2.inOut" }, 0.5)
        .to(lines, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.35, ease: "power2.out" }, 0.55)
        .to(".hero-subtitle", { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, ">0.30")
        .to(cta, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, ">0.20")
        .to(logos, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "power2.out" }, ">0.15");

      // Start playing the animation if section is active
      if (isActive) {
        tl.play();
      }

      // Keep a reference to the timeline for manual control
      scrollTriggerRef.current = {
        timeline: tl,
        kill: () => {
          tl.kill();
        }
      };

      // Also create a scroll-based version for non-PinSection mode
      // This will be used when the PinSection is not active
      if (!isActive) {
        scrollTriggerRef.current = ScrollTrigger.create({
          id: `hero-scroll-${Date.now()}`,
          trigger: el,
          start: "top top",
          end: "+=250vh",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          immediateRender: true,
          animation: tl,
          onUpdate(self) {
            setAnimationProgress(self.progress);
            if (self.progress < 0.001) {
              gsap.set(mask, { "--clip": START });
              gsap.set(img, { scale: 0.8 });
              gsap.set(blur, { filter: "blur(10px)" });
              gsap.set(lines, { autoAlpha: 0, y: 40 });
              gsap.set(txt, { autoAlpha: 0, y: 20 });
              gsap.set(cta, { autoAlpha: 0, scale: 0.8 });
              gsap.set(mq, { autoAlpha: 1 });
              gsap.set(logos, { autoAlpha: 0, y: 30 });
            }
          }
        });
      }
    }, heroRef);

    setTimeout(() => ScrollTrigger.refresh(), 100);
    isInitializedRef.current = true;
  };

  // Update animation when active state changes
  useEffect(() => {
    if (scrollTriggerRef.current && scrollTriggerRef.current.timeline) {
      if (isActive) {
        scrollTriggerRef.current.timeline.play();
      } else {
        scrollTriggerRef.current.timeline.pause();
      }
    }
  }, [isActive]);

  useLayoutEffect(() => {
    cleanup();
    setupAnimations();
    return cleanup;
  }, [hero.title, isTransitioning]);

  return (
    <section
      className={`hero ${isActive ? 'active' : ''}`}
      ref={heroRef}
      data-section-id="hero"
    >
      <div className="hero-img">
        <video
          src="/videos/hero-web.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="hero-img-element"
          poster="data:image/gif;base64,..."
          style={{
            maxHeight: "100vh",
            objectFit: "contain",
            display: "block",
            margin: "0 auto"
          }}
        />
      </div>
      <Marquee text={hero.marquee} />
      <div className="hero-text-wrapper" ref={txtBoxRef}>
        <h1 className="hero-title" />
        <p className="hero-subtitle">{hero.subtitle}</p>
        <div className="hero-logos">
          <img src="/images/logos/clutch.svg" alt="Clutch" />
          <img src="/images/logos/designrush.svg" alt="DesignRush" />
          <img src="/images/logos/awwwards.svg" alt="Awwwards" />
          <img src="/images/logos/google-review.svg" alt="Google" />
        </div>
      </div>
      <button className="cta-button">{hero.cta}</button>

      {isActive && animationProgress > 0.95 && (
        <div className="scroll-indicator">
          <span>Scroll to continue</span>
          <div className="scroll-arrow"></div>
        </div>
      )}
    </section>
  );
}
