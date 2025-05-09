// src/components/FinalHero/FinalHero.jsx
"use client";

import Link from "next/link";
import "./FinalHero.css";

export default function FinalHero() {
  return (
    <section className="final-hero">
      <div className="final-hero-content">
        <h2 className="final-hero-title">Let’s make it real.</h2>
        <p className="final-hero-text">
          Ready to turn vision into reality?<br />
          Let’s build something that lasts.
        </p>
        <Link href="/contact">
          <button className="final-hero-cta">Start a conversation</button>
        </Link>
      </div>
    </section>
  );
}