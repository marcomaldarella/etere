"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import { useContent } from "@/context/ContentContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import "./Carousel.css";

export default function Carousel() {
    const { home } = useContent();
    const items = home?.carousel || [];

    const containerRef = useRef(null);
    const panelsRef = useRef([]);
    const animationCtxRef = useRef(null);
    const pinTriggerRef = useRef(null);

    // Cleanup di tutte le animazioni create da questo componente
    const cleanup = () => {
        console.log("🧹 Pulizia Carousel");

        // Pulisci il contesto GSAP
        if (animationCtxRef.current) {
            animationCtxRef.current.revert();
            animationCtxRef.current = null;
        }

        // Assicurati che nessun riferimento rimanga
        pinTriggerRef.current = null;

        // Reset dell'array dei pannelli
        panelsRef.current = [];
    };

    // Setup iniziale una volta sola al mount
    useLayoutEffect(() => {
        console.log("🎬 Carousel mounted");

        return () => {
            console.log("🛑 Carousel unmounted");
            cleanup();
        };
    }, []);

    // Crea le animazioni quando i contenuti sono disponibili
    useEffect(() => {
        if (!containerRef.current || !items.length || typeof window === "undefined") return;

        console.log("🔄 Inizializzazione animazioni Carousel");

        // Pulisci sempre prima di iniziare
        cleanup();

        // Assicurati che ScrollTrigger sia registrato
        gsap.registerPlugin(ScrollTrigger);

        // Crea un nuovo contesto GSAP
        animationCtxRef.current = gsap.context(() => {
            // Ottieni i pannelli attuali
            const panels = panelsRef.current.filter(panel => panel);
            if (!panels.length) return;

            // Imposta lo stato iniziale
            gsap.set(panels[0], {
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
            });

            if (panels.length > 1) {
                gsap.set(panels.slice(1), {
                    clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                });
            }

            // Crea il pin principale
            pinTriggerRef.current = ScrollTrigger.create({
                id: "carousel-pin",
                trigger: containerRef.current,
                start: "top top",
                end: () => `+=${(panels.length - 1) * 100}vh`,
                pin: true,
                pinSpacing: true,
                anticipatePin: 1,
                scrub: 1,
                onEnter: () => console.log("⬇️ Carousel entered viewport"),
                onUpdate: (self) => {
                    const progress = self.progress * (panels.length - 1);
                    const currentIndex = Math.floor(progress);
                    const nextProgress = progress - currentIndex;

                    panels.forEach((panel, i) => {
                        if (i < currentIndex) {
                            // Pannelli precedenti completamente visibili
                            gsap.set(panel, {
                                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                            });
                        } else if (i === currentIndex) {
                            // Pannello corrente completamente visibile
                            gsap.set(panel, {
                                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                            });
                        } else if (i === currentIndex + 1) {
                            // Prossimo pannello che sta comparendo
                            const clipPath = gsap.utils.interpolate(
                                "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
                                "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                                nextProgress
                            );
                            gsap.set(panel, { clipPath });
                        } else {
                            // Pannelli futuri nascosti
                            gsap.set(panel, {
                                clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                            });
                        }
                    });
                }
            });
        }, containerRef);

        // Forza un refresh di ScrollTrigger dopo le modifiche
        if (typeof window !== "undefined") {
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }

        return cleanup;
    }, [items]);

    if (!items.length) {
        return <div className="carousel-empty">No carousel content available</div>;
    }

    return (
        <section className="carousel-section" ref={containerRef}>
            <div className="carousel-container">
                {items.map((item, index) => (
                    <div
                        className="carousel-panel"
                        key={item.id}
                        ref={el => {
                            if (el) panelsRef.current[index] = el;
                        }}
                        style={{
                            clipPath: index === 0
                                ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                                : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
                        }}
                    >
                        <div className="carousel-image">
                            <img src={item.bg} alt={item.title} />
                        </div>
                        <div className="carousel-text">
                            <div className="carousel-expertise">Our Expertise</div>
                            <div className="carousel-index">{item.index}</div>
                            <h2 className="carousel-title">{item.title}</h2>
                            <p className="carousel-sub">{item.subtitle}</p>
                            <p className="carousel-desc">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
