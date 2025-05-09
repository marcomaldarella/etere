"use client";

import { useParams } from 'next/navigation';
import { useContent } from '@/context/ContentContext';
import { useLenis } from '@studio-freight/react-lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLayoutEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer/Footer';
import './project.css';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectPage() {
    const { id } = useParams();
    const { projects } = useContent();
    const project = projects?.find(p => p?.id === id);

    const lenis = useLenis();
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    // 🧼 Hard cleanup
    useLayoutEffect(() => {
        ScrollTrigger.killAll(true);
        gsap.globalTimeline.clear();

        return () => {
            ScrollTrigger.killAll(true);
            gsap.globalTimeline.clear();
        };
    }, []);

    // ✅ Animation setup
    useLayoutEffect(() => {
        if (!project || !lenis || !containerRef.current || !imageRef.current) return;

        setTimeout(() => {
            const ctx = gsap.context(() => {
                gsap.to(imageRef.current, {
                    scale: 1.05,
                    y: -30,
                    ease: "none",
                    scrollTrigger: {
                        trigger: imageRef.current,
                        start: "top bottom",
                        end: "bottom top",
                    },
                });

                gsap.from(containerRef.current.querySelectorAll("h1, .label, p, ul li"), {
                    opacity: 0,
                    y: 30,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                });

                ScrollTrigger.refresh(true);
            }, containerRef);

            setIsReady(true);

            return () => ctx.revert();
        }, 100); // 🔁 Attendi 1 frame
    }, [lenis, project]);

    if (!project) return <div className="project-page loading">Project not found</div>;

    return (
        <>
            <main className="project-page" ref={containerRef} style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.3s ease" }}>
                <section className="project-header">
                    <div className="image-wrapper" ref={imageRef}>
                        <h1>{project.title}</h1>
                        <img src={project.cover} alt={project.title} />
                    </div>
                </section>

                <section className="project-details">
                    <div className="left-col">
                        <p className="label">Client</p>
                        <p>{project.client}</p>
                        <p className="label">Sector</p>
                        <p>{project.sector}</p>
                        <p className="label">Tech</p>
                        <p>{project.tech}</p>
                    </div>

                    <div className="right-col">
                        <p className="label">❌ Pain Point</p>
                        <p>{project.pain}</p>
                        <p className="label">✅ Solution</p>
                        <p>{project.solution}</p>

                        {project.highlights?.length > 0 && (
                            <>
                                <p className="label">Highlights</p>
                                <ul>
                                    {project.highlights.map((h, i) => (
                                        <li key={i}>{h}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        <p className="label">UI Extracts</p>
                        <div className="image-row">
                            {project.images?.length > 0 ? (
                                project.images.map((src, i) => (
                                    <img key={i} src={src} alt={`UI ${i + 1}`} />
                                ))
                            ) : (
                                <p>No UI extracts available</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
