"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useContent } from "@/context/ContentContext";
import "./ProjectsSlider.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { killAllScrollTriggers } from "@/lib/gsap-utils";
import gsap from "gsap";

export default function ProjectsSlider() {
    const { projects } = useContent();
    const slides = projects || [];
    const len = slides.length;

    const router = useRouter();
    const [current, setCurrent] = useState(0);
    const mainRef = useRef(null);
    const previewRef = useRef(null);
    const gsapRef = useRef(null);
    const animationRef = useRef(null);

    const prev = () => setCurrent((c) => (c - 1 + len) % len);
    const next = () => setCurrent((c) => (c + 1) % len);

    const main = slides[current];
    const preview = slides[(current + 1) % len];

    useEffect(() => {
        const initGSAP = async () => {
            try {
                if (!gsapRef.current) {
                    const gsapModule = await import("gsap");
                    gsapRef.current = gsapModule.default;
                }

                if (!mainRef.current || !previewRef.current) return;

                if (animationRef.current) {
                    animationRef.current.kill();
                }

                const tl = gsapRef.current.timeline();
                tl.to([mainRef.current, previewRef.current], {
                    opacity: 0,
                    y: 10,
                    duration: 0.2,
                    stagger: 0.1,
                }).to(
                    [mainRef.current, previewRef.current],
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.15,
                        ease: "power2.out",
                    },
                    "+=0.05"
                );

                animationRef.current = tl;
            } catch (error) {
                console.error("Error initializing GSAP in ProjectsSlider:", error);
            }
        };

        initGSAP();

        return () => {
            if (animationRef.current) {
                animationRef.current.kill();
                animationRef.current = null;
            }
        };
    }, [current]);

    const handleNavigate = async (id) => {
        if (animationRef.current) {
            animationRef.current.kill();
            animationRef.current = null;
        }

        try {
            gsap.globalTimeline.clear();
            ScrollTrigger.getAll().forEach((t) => t.kill());
            await killAllScrollTriggers();

            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        } catch (e) {
            console.warn("Error during cleanup", e);
        }

        router.push(`/projects/${id}`);
    };

    if (len === 0) return null;

    return (
        <section className="projects-slider">
            <div className="ps-header">
                <h2>Projects</h2>
                <div className="ps-controls">
                    <button onClick={prev}>←</button>
                    <span className="ps-counter">
                        {String(current + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
                    </span>
                    <button onClick={next}>→</button>
                </div>
            </div>

            <div className="ps-slots">
                <div className="ps-slot ps-slot-main">
                    <div
                        className="ps-image-wrapper-main"
                        onClick={() => handleNavigate(main.id)}
                        role="button"
                        style={{ cursor: "pointer" }}
                    >
                        <img src={main.cover || "/placeholder.svg"} alt={main.title} />
                    </div>
                </div>

                <div className="ps-slot ps-slot-preview">
                    <div
                        className="ps-image-wrapper"
                        onClick={() => handleNavigate(preview.id)}
                        role="button"
                        style={{ cursor: "pointer" }}
                    >
                        <img src={preview.cover || "/placeholder.svg"} alt={preview.title} />
                    </div>
                    <div className="ps-info-preview" ref={previewRef}>
                        <h3>{preview.title}</h3>
                        <p>{preview.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="ps-details">
                <div className="ps-detail ps-detail-main" ref={mainRef}>
                    <h3 className="black">{main.title}</h3>
                    <p>{main.subtitle}</p>
                    <span className="ps-tag">{main.tag}</span>
                    <div className="ps-categories">
                        {main.categories.map((cat) => (
                            <span key={cat}>{cat}</span>
                        ))}
                    </div>
                </div>
                <div className="ps-detail ps-detail-preview">
                    <h3 className="black">{preview.title}</h3>
                    <p>{preview.subtitle}</p>
                </div>
            </div>
        </section>
    );
}
