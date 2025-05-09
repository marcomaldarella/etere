"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Marquee from "@/components/Marquee/Marquee";
import { useContent } from "@/context/ContentContext";
import "./Hero.css";

const START = "polygon(37.5% 10%, 62.5% 10%, 62.5% 90%, 37.5% 90%)";
const MID = "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)";
const END = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";

export default function Hero() {
  const { home } = useContent();

  if (!home || !home.hero) return null;

  const { hero } = home;
  const heroRef = useRef(null);
  const txtBoxRef = useRef(null);
  const animCtxRef = useRef(null);

  const cleanup = () => {
    if (animCtxRef.current) {
      animCtxRef.current.revert();
      animCtxRef.current = null;
    }
  };

  useLayoutEffect(() => {
    if (!heroRef.current || typeof window === "undefined") return;

    cleanup();
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
          )
          .join(" ");
      }

      const mask = el.querySelector(".hero-img");
      const img = mask?.querySelector("img");
      const blur = el.querySelector(".blur-word");
      const lines = el.querySelectorAll(".hero-line");
      const txt = txtBoxRef.current;
      const cta = el.querySelector(".cta-button");
      const mq = el.querySelector(".marquee");

      if (!mask || !img || !blur || !lines.length || !txt || !cta || !mq) return;

      gsap.set(mask, {
        "--clip": START,
        visibility: "visible",
        opacity: 1,
        scaleY: 0.95,
        y: 20,
      });
      gsap.set(img, { scale: 0.8, opacity: 1 });
      gsap.set(blur, { filter: "blur(12px)" });
      gsap.set(lines, { autoAlpha: 0, y: 40 });
      gsap.set(txt, { autoAlpha: 0, y: 20 });
      gsap.set(cta, { autoAlpha: 0, scale: 0.8 });
      gsap.set(mq, { autoAlpha: 1 });

      const tl = gsap.timeline();

      tl.to(mask, {
        opacity: 1,
        scaleY: 1,
        y: 0,
        duration: 2,
        ease: "power1.out",
      }).to(blur, {
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power2.out",
      }, "<");

      const scrollTL = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=250vh",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        }
      });

      scrollTL
        .to(mq, { autoAlpha: 0, ease: "power2.out" }, 0)
        .fromTo(mask, { "--clip": START }, { "--clip": MID, ease: "power2.inOut" }, 0)
        .to(img, { scale: 2.5, ease: "power2.out" }, 0)
        .to(txt, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.35)
        .to(mask, { "--clip": END, ease: "power2.inOut" }, 0.5)
        .to(lines, { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.35, ease: "power2.out" }, 0.55)
        .to(".hero-subtitle", { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, ">0.30")
        .to(cta, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, ">0.20");
    }, heroRef);

    setTimeout(() => ScrollTrigger.refresh(), 100);
    return cleanup;
  }, [hero.title]);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-img">
        <img src="/images/home/hero.jpeg" alt="Hero" className="hero-img-element" />
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
    </section>
  );
}
