"use client";

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import './PinSection.css';

/**
 * PinSection - Manages pinned sections for full-page scroll experience
 * Each child component should have a data-section-id attribute and listen
 * for 'sectionActivated' and dispatch 'sectionComplete' events
 */
export default function PinSection({ children }) {
    const containerRef = useRef(null);
    const [activeSection, setActiveSection] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [sections, setSections] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const pathname = usePathname();
    const lastScrollTime = useRef(Date.now());

    // Debug logging
    const log = (message) => {
        console.log(`[PinSection] ${message}`);
    };

    // Initialize sections
    useEffect(() => {
        if (!containerRef.current) return;

        const sectionElements = Array.from(containerRef.current.children)
            .filter(child => child.hasAttribute('data-section-id'))
            .map(child => ({
                id: child.getAttribute('data-section-id'),
                element: child,
                height: child.offsetHeight
            }));

        setSections(sectionElements);
        log(`Found ${sectionElements.length} pinnable sections`);

        // Start with the first section active
        if (sectionElements.length > 0) {
            setActiveSection(0);
            activateSection(0);
            setIsInitialized(true);
        }

    }, [children]);

    // Reset scroll position and sections when route changes
    useEffect(() => {
        if (!pathname) return;

        // Reset scroll position
        window.scrollTo(0, 0);
        setActiveSection(0);

        // Reactivate the first section after a short delay
        setTimeout(() => {
            if (sections.length > 0) {
                activateSection(0, true);
            }
        }, 200);

    }, [pathname]);

    // Listen for section completion events from child components
    useEffect(() => {
        const handleSectionComplete = (e) => {
            const { id, direction } = e.detail;
            const currentIndex = sections.findIndex(section => section.id === id);

            if (currentIndex === -1) return;

            if (direction === 'down' && currentIndex < sections.length - 1) {
                // Go to next section
                goToSection(currentIndex + 1);
            } else if (direction === 'up' && currentIndex > 0) {
                // Go to previous section
                goToSection(currentIndex - 1);
            } else if (direction === 'down' && currentIndex === sections.length - 1) {
                // Allow normal scrolling after last section
                document.body.style.overflow = '';
                window.scrollBy(0, 100); // Scroll a bit to show we're out of pinned mode
            }
        };

        window.addEventListener('sectionComplete', handleSectionComplete);
        return () => window.removeEventListener('sectionComplete', handleSectionComplete);
    }, [sections]);

    // Handle scroll events for section activation
    useEffect(() => {
        if (!isInitialized || sections.length === 0) return;

        const handleWheel = (e) => {
            e.preventDefault();

            // Throttle scroll events
            const now = Date.now();
            if (now - lastScrollTime.current < 1000 || isAnimating) return;
            lastScrollTime.current = now;

            const direction = e.deltaY > 0 ? 'down' : 'up';

            if (direction === 'down' && activeSection < sections.length - 1) {
                goToSection(activeSection + 1);
            } else if (direction === 'up' && activeSection > 0) {
                goToSection(activeSection - 1);
            } else if (direction === 'down' && activeSection === sections.length - 1) {
                // Allow normal scrolling after last section
                document.body.style.overflow = '';
                window.scrollBy(0, 100); // Scroll a bit to show we're out of pinned mode
            }
        };

        // Setup touch events
        let touchStartY = 0;
        let isTouchActive = false;

        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
            isTouchActive = true;
        };

        const handleTouchMove = (e) => {
            if (!isTouchActive || isAnimating || !sections[activeSection]) return;

            const touchCurrentY = e.touches[0].clientY;
            const difference = touchStartY - touchCurrentY;

            if (Math.abs(difference) > 50) {
                e.preventDefault();
                isTouchActive = false;

                const now = Date.now();
                if (now - lastScrollTime.current < 1000) return;
                lastScrollTime.current = now;

                const direction = difference > 0 ? 'down' : 'up';

                if (direction === 'down' && activeSection < sections.length - 1) {
                    goToSection(activeSection + 1);
                } else if (direction === 'up' && activeSection > 0) {
                    goToSection(activeSection - 1);
                }
            }
        };

        const handleTouchEnd = () => {
            isTouchActive = false;
        };

        // Add event listeners
        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('wheel', handleWheel);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isInitialized, sections, activeSection, isAnimating]);

    // Activate a section by index
    const activateSection = (index, reset = false) => {
        if (index < 0 || index >= sections.length) return;

        // Dispatch event to notify the section it's becoming active
        window.dispatchEvent(new CustomEvent('sectionActivated', {
            detail: {
                id: sections[index].id,
                reset
            }
        }));

        // Force scroll to its position
        window.scrollTo({
            top: document.body.scrollHeight * index / sections.length,
            behavior: 'smooth'
        });

        // Lock scrolling for pinned sections
        document.body.style.overflow = 'hidden';

        log(`Activated section: ${sections[index].id}`);
    };

    // Go to a section with animation
    const goToSection = (index) => {
        if (index < 0 || index >= sections.length || isAnimating) return;

        setIsAnimating(true);
        activateSection(index);
        setActiveSection(index);

        // After animation completes
        setTimeout(() => {
            setIsAnimating(false);
        }, 1000);
    };

    return (
        <div className="pin-section-container" ref={containerRef}>
            {children}

            <div className="pin-section-indicators">
                {sections.map((section, index) => (
                    <button
                        key={section.id}
                        className={`pin-section-indicator ${activeSection === index ? 'active' : ''}`}
                        onClick={() => goToSection(index)}
                        aria-label={`Go to section ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
} 