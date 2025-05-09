"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useContent } from "@/context/ContentContext";
import { usePathname } from "next/navigation";
import { useTransition } from "@/components/PageWrapper/PageWrapper";
import "./Carousel.css";

export default function Carousel() {
    const { home } = useContent();
    const items = home?.carousel || [];
    const pathname = usePathname();
    const { isTransitioning } = useTransition();

    const containerRef = useRef(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [scrollAllowed, setScrollAllowed] = useState(true);
    const [lastScrollTime, setLastScrollTime] = useState(0);
    const [isPinned, setIsPinned] = useState(false); // Start unpinned
    const [isActive, setIsActive] = useState(false);
    const [carouselCompleted, setCarouselCompleted] = useState(false);
    const [debug, setDebug] = useState("Ready");

    // Settings
    const TOTAL_SLIDES_TO_SHOW = 3; // Number of slides to show before unpinning

    // Log helper
    const log = (message) => {
        console.log(`[Carousel] ${message}`);
        setDebug(message);
    };

    // Check if we can unpin the carousel
    const checkUnpinCarousel = useCallback(() => {
        // If we've reached the last slide to show, allow unpinning
        if (currentSlide >= TOTAL_SLIDES_TO_SHOW - 1 || currentSlide >= items.length - 1) {
            setCarouselCompleted(true);
        }
    }, [currentSlide, items.length]);

    // Create a new slide element
    const createSlide = (item, direction) => {
        const slide = document.createElement("div");
        slide.className = "carousel-panel";

        // Create background image
        const bgImage = document.createElement("div");
        bgImage.className = "carousel-image";

        const img = document.createElement("img");
        img.src = item.bg;
        img.alt = item.title;

        bgImage.appendChild(img);
        slide.appendChild(bgImage);

        // Create text content
        const textDiv = document.createElement("div");
        textDiv.className = "carousel-text";

        const expertiseDiv = document.createElement("div");
        expertiseDiv.className = "carousel-expertise";
        expertiseDiv.textContent = "Our Expertise";

        const indexDiv = document.createElement("div");
        indexDiv.className = "carousel-index";
        indexDiv.textContent = item.index;

        const titleH2 = document.createElement("h2");
        titleH2.className = "carousel-title";
        titleH2.textContent = item.title;

        const subP = document.createElement("p");
        subP.className = "carousel-sub";
        subP.textContent = item.subtitle;

        const descP = document.createElement("p");
        descP.className = "carousel-desc";
        descP.textContent = item.description;

        textDiv.appendChild(expertiseDiv);
        textDiv.appendChild(indexDiv);
        textDiv.appendChild(titleH2);
        textDiv.appendChild(subP);
        textDiv.appendChild(descP);

        slide.appendChild(textDiv);

        // Set initial state based on direction
        if (direction === "down") {
            bgImage.style.clipPath = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
        } else if (direction === "up") {
            bgImage.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
        } else {
            bgImage.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
        }

        return { slide, textElements: { expertiseDiv, indexDiv, titleH2, subP, descP } };
    };

    // Animate between slides
    const animateSlide = (direction) => {
        if (isAnimating || !scrollAllowed || items.length < 2 || !isActive) return;

        // If carousel is completed and trying to scroll down, allow page to scroll
        if (carouselCompleted && direction === "down") {
            // Dispatch a custom event to notify that this section is complete
            window.dispatchEvent(new CustomEvent('sectionComplete', {
                detail: { id: 'carousel', direction: 'down' }
            }));
            return;
        }

        // If direction is up and we're at the first slide, allow page to scroll up
        if (direction === "up" && currentSlide === 0) {
            // Dispatch a custom event to notify that we want to go to previous section
            window.dispatchEvent(new CustomEvent('sectionComplete', {
                detail: { id: 'carousel', direction: 'up' }
            }));
            return;
        }

        log(`Animating ${direction}`);
        setIsAnimating(true);
        setScrollAllowed(false);

        const container = containerRef.current;
        if (!container) return;

        // Get current slide
        const currentSlideEl = container.querySelector(".carousel-panel");
        if (!currentSlideEl) return;

        const currentBgImg = currentSlideEl.querySelector(".carousel-image");
        const currentTextEls = {
            expertise: currentSlideEl.querySelector(".carousel-expertise"),
            index: currentSlideEl.querySelector(".carousel-index"),
            title: currentSlideEl.querySelector(".carousel-title"),
            sub: currentSlideEl.querySelector(".carousel-sub"),
            desc: currentSlideEl.querySelector(".carousel-desc")
        };

        // Calculate next slide index
        let nextSlideIndex;
        if (direction === "down") {
            nextSlideIndex = (currentSlide + 1) % items.length;
        } else {
            nextSlideIndex = (currentSlide - 1 + items.length) % items.length;
        }

        // Create next slide
        const { slide: nextSlideEl, textElements: nextTextEls } = createSlide(items[nextSlideIndex], direction);
        container.appendChild(nextSlideEl);

        // Set initial positions for text elements
        const yOffset = direction === "down" ? 40 : -40;
        Object.values(nextTextEls).forEach(el => {
            el.style.opacity = "0";
            el.style.transform = `translateY(${yOffset}px)`;
        });

        // Import GSAP dynamically
        import('gsap').then(({ gsap }) => {
            import('gsap/CustomEase').then(({ CustomEase }) => {
                gsap.registerPlugin(CustomEase);
                const customEase = CustomEase.create("custom", ".87,0,.13,1");

                const tl = gsap.timeline({
                    onComplete: () => {
                        // Clean up
                        if (currentSlideEl && currentSlideEl.parentNode) {
                            currentSlideEl.remove();
                        }

                        setCurrentSlide(nextSlideIndex);
                        setIsAnimating(false);

                        // Check if we should unpin the carousel
                        checkUnpinCarousel();

                        // Allow scrolling after a delay
                        setTimeout(() => {
                            setScrollAllowed(true);
                            setLastScrollTime(Date.now());
                        }, 100);
                    }
                });

                // Animate background image transitions
                tl.to(currentBgImg.querySelector("img"), {
                    scale: 1.2,
                    duration: 1.25,
                    ease: customEase
                }, 0);

                tl.to(nextSlideEl.querySelector(".carousel-image"), {
                    clipPath: direction === "down"
                        ? "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)"
                        : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    duration: 1.25,
                    ease: customEase
                }, 0);

                // Animate current text elements out
                Object.values(currentTextEls).forEach(el => {
                    tl.to(el, {
                        y: direction === "down" ? -40 : 40,
                        opacity: 0,
                        duration: 0.8,
                        ease: customEase
                    }, 0);
                });

                // Animate next text elements in
                Object.values(nextTextEls).forEach(el => {
                    tl.to(el, {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: customEase
                    }, 0.3);
                });
            });
        });
    };

    // Handle wheel events
    const handleWheel = (e) => {
        if (!isActive) return;

        e.preventDefault();
        const now = Date.now();
        if (now - lastScrollTime < 1000) return;

        const direction = e.deltaY > 0 ? "down" : "up";
        animateSlide(direction);
        setLastScrollTime(now);
    };

    // Handle touch events
    useEffect(() => {
        if (!containerRef.current || items.length < 2) return;

        let touchStartY = 0;
        let isTouchActive = false;

        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
            isTouchActive = true;
        };

        const handleTouchMove = (e) => {
            if (!isActive) return;

            e.preventDefault();
            if (!isTouchActive || isAnimating || !scrollAllowed) return;

            const touchCurrentY = e.touches[0].clientY;
            const difference = touchStartY - touchCurrentY;

            if (Math.abs(difference) > 50) {
                isTouchActive = false;
                const direction = difference > 0 ? "down" : "up";
                animateSlide(direction);
            }
        };

        const handleTouchEnd = () => {
            isTouchActive = false;
        };

        const container = containerRef.current;
        container.addEventListener("touchstart", handleTouchStart, { passive: false });
        container.addEventListener("touchmove", handleTouchMove, { passive: false });
        container.addEventListener("touchend", handleTouchEnd);

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleTouchMove);
            container.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isAnimating, scrollAllowed, lastScrollTime, items.length, isActive]);

    // Setup wheel event listener
    useEffect(() => {
        if (!containerRef.current || items.length < 2) return;

        const container = containerRef.current;
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, [lastScrollTime, isAnimating, scrollAllowed, items.length, isActive]);

    // Listen for section activation events from the parent pin system
    useEffect(() => {
        const handleSectionChange = (e) => {
            if (e.detail.id === 'carousel') {
                setIsActive(true);
                setIsPinned(true);

                // Reset carousel if it's being reactivated
                if (e.detail.reset) {
                    setCurrentSlide(0);
                    setCarouselCompleted(false);

                    // Re-initialize the first slide
                    if (containerRef.current && items.length > 0) {
                        const container = containerRef.current;
                        container.innerHTML = "";
                        const { slide } = createSlide(items[0]);
                        container.appendChild(slide);
                    }
                }
            } else {
                setIsActive(false);
                setIsPinned(false);
            }
        };

        window.addEventListener('sectionActivated', handleSectionChange);

        return () => {
            window.removeEventListener('sectionActivated', handleSectionChange);
        };
    }, [items]);

    // Initialize first slide
    useEffect(() => {
        if (!containerRef.current || items.length === 0 || isTransitioning) return;

        // Reset state
        setCurrentSlide(0);
        setIsPinned(false); // Start unpinned
        setIsActive(false); // Start inactive
        setCarouselCompleted(false);

        // Clear any existing slides
        const container = containerRef.current;
        container.innerHTML = "";

        // Add first slide
        const { slide } = createSlide(items[0]);
        container.appendChild(slide);

        log("Initialized carousel");

    }, [items, pathname, isTransitioning]);

    // Reset scroll when changing pages
    useEffect(() => {
        if (!pathname) return;

        // Reset scroll position when route changes
        window.scrollTo(0, 0);

        // Reset carousel state
        setCurrentSlide(0);
        setIsPinned(false);
        setIsActive(false);
        setCarouselCompleted(false);

    }, [pathname]);

    // Empty state
    if (!items.length) {
        return <div className="carousel-empty">No carousel content available</div>;
    }

    return (
        <section
            className={`carousel-section ${isPinned ? 'pinned' : ''} ${isActive ? 'active' : ''}`}
            ref={containerRef}
            data-section-id="carousel"
        >
            {/* Initial slide will be created by the effect */}
            {isActive && carouselCompleted && (
                <div className="carousel-indicator">
                    <span>Scroll to continue</span>
                    <div className="carousel-arrow"></div>
                </div>
            )}
        </section>
    );
}
