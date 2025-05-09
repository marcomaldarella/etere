"use client";

import React, { useEffect, useState, useRef } from "react";
import { useContent } from "@/context/ContentContext";
import gsap from "gsap";
import "./Services.css";

export default function Services() {
  const { services } = useContent();
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef(null);
  const animationsRef = useRef(null);

  // Listen for section activation events from PinSection
  useEffect(() => {
    const handleSectionActivated = (e) => {
      if (e.detail.id === 'services') {
        console.log("🎬 Services section activated");
        setIsActive(true);

        // Animate in the services when activated
        animateServicesIn();
      } else {
        setIsActive(false);

        // Reset animations when deactivated
        if (animationsRef.current) {
          animationsRef.current.progress(0).pause();
        }
      }
    };

    window.addEventListener('sectionActivated', handleSectionActivated);
    return () => {
      window.removeEventListener('sectionActivated', handleSectionActivated);
    };
  }, []);

  // Handle wheel events for section completion
  useEffect(() => {
    if (!isActive || !sectionRef.current) return;

    const handleWheel = (e) => {
      // Get scroll position and check if we're at the bottom of the section
      const section = sectionRef.current;
      if (!section) return;

      const isAtBottom = section.getBoundingClientRect().bottom <= window.innerHeight;

      // If scrolling down and animations are complete, signal section completion
      if (e.deltaY > 0 && isAtBottom) {
        window.dispatchEvent(new CustomEvent('sectionComplete', {
          detail: { id: 'services', direction: 'down' }
        }));
      }

      // If scrolling up and at the top, signal section completion upward
      if (e.deltaY < 0 && section.getBoundingClientRect().top >= 0) {
        window.dispatchEvent(new CustomEvent('sectionComplete', {
          detail: { id: 'services', direction: 'up' }
        }));
      }
    };

    sectionRef.current.addEventListener('wheel', handleWheel);
    return () => {
      if (sectionRef.current) {
        sectionRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isActive]);

  // Animation for services
  const animateServicesIn = () => {
    if (!sectionRef.current) return;

    // Clean up any existing animations
    if (animationsRef.current) {
      animationsRef.current.kill();
    }

    const tl = gsap.timeline();

    // Animate title and description
    tl.from(".servicesTitle, .servicesDescription", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out"
    });

    // Animate service items
    tl.from(".serviceItem", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out"
    }, "-=0.4");

    // Store the timeline for later reference
    animationsRef.current = tl;

    // Play the animation immediately if the section is active
    if (isActive) {
      tl.play();
    } else {
      tl.pause();
    }
  };

  return (
    <section
      className={`services ${isActive ? 'active' : ''}`}
      ref={sectionRef}
      data-section-id="services"
    >
      <div className="services-entry">
        <h2 className="servicesTitle">{services.header}</h2>
        <p className="servicesDescription">{services.description}</p>
      </div>

      <div className="servicesList">
        {services.items.map((item, idx) => (
          <div className="serviceItem" key={idx}>
            <div className="serviceLeft">{item.title}</div>
            <div className="serviceCenter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="2" />
              </svg>
            </div>
            <div className="serviceRight">
              <div className="serviceDescription">{item.description}</div>
              <div className="serviceIndex">
                {String(idx + 1).padStart(2, "0")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isActive && (
        <div className="scroll-indicator">
          <span>Scroll to continue</span>
          <div className="scroll-arrow"></div>
        </div>
      )}
    </section>
  );
}
