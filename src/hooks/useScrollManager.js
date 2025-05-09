"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/**
 * A hook for centralized management of ScrollTrigger animations
 * with proper cleanup and SSR compatibility
 */
export function useScrollManager() {
    const contextRef = useRef(null);
    const triggersRef = useRef([]);
    const isCleaningRef = useRef(false);

    // Initialize on component mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);

        // Esponi l'hook globalmente per poterlo usare in PageWrapper
        window.scrollManagerReady = true;

        // Esponi una funzione globale di reset per l'accesso da altri componenti
        window.resetScrollAnimations = () => {
            cleanup();
            setTimeout(() => {
                refresh();
            }, 50);
        };

        return () => {
            cleanup();
            window.scrollManagerReady = false;
            window.resetScrollAnimations = null;
        };
    }, []);

    /**
     * Create a GSAP context and store it for later cleanup
     * @param {Function} callback Function to execute within context
     * @param {HTMLElement} scope Element to scope the context to
     */
    const createContext = (callback, scope) => {
        if (typeof window === "undefined") return null;

        // Clean up previous context if it exists
        if (contextRef.current) {
            contextRef.current.revert();
        }

        // Create and store the new context
        contextRef.current = gsap.context(callback, scope);

        return contextRef.current;
    };

    /**
     * Register a ScrollTrigger instance for tracking and later cleanup
     * @param {ScrollTrigger} trigger The ScrollTrigger instance to track
     */
    const registerTrigger = (trigger) => {
        if (trigger) {
            triggersRef.current.push(trigger);
        }
    };

    /**
     * Clean up all GSAP animations and ScrollTrigger instances
     */
    const cleanup = () => {
        if (typeof window === "undefined" || isCleaningRef.current) return;

        // Previene chiamate ricorsive durante la pulizia
        isCleaningRef.current = true;

        console.log("🧹 Cleaning up ScrollTrigger instances");

        try {
            // Prima interrompi tutte le animazioni in corso
            gsap.killTweensOf("*");

            // Elimina tutti i timeline
            gsap.globalTimeline.clear();

            // Kill all tracked triggers
            if (triggersRef.current.length) {
                triggersRef.current.forEach(trigger => {
                    if (trigger && trigger.kill) {
                        trigger.kill(true); // true = pulizia completa
                    }
                });
                triggersRef.current = [];
            }

            // Kill all ScrollTrigger instances for safety
            ScrollTrigger.getAll().forEach(trigger => {
                trigger.kill(true);
            });

            // Clear the context
            if (contextRef.current) {
                contextRef.current.revert();
                contextRef.current = null;
            }

            // Try to clear ScrollTrigger memory
            if (ScrollTrigger.clearScrollMemory) {
                ScrollTrigger.clearScrollMemory();
            }

            // Force a complete refresh of ScrollTrigger
            ScrollTrigger.refresh(true);

            console.log("✅ Cleanup complete");
        } catch (error) {
            console.error("❌ Error during ScrollTrigger cleanup:", error);
        } finally {
            isCleaningRef.current = false;
        }
    };

    /**
     * Refresh ScrollTrigger after DOM changes
     */
    const refresh = () => {
        if (typeof window === "undefined") return;

        try {
            ScrollTrigger.refresh(true);
            console.log("🔄 ScrollTrigger refreshed");
        } catch (error) {
            console.error("❌ Error during ScrollTrigger refresh:", error);
        }
    };

    /**
     * Reset scroll position to top
     * @param {Object} options - Options for scroll reset
     * @param {boolean} options.immediate - Whether to skip animations
     */
    const resetScroll = (options = { immediate: true }) => {
        if (typeof window === "undefined") return;

        // Resetta lo scroll nativo
        window.scrollTo(0, 0);

        // Resetta anche Lenis se disponibile
        if (window.lenis) {
            window.lenis.scrollTo(0, {
                immediate: options.immediate,
                force: true
            });
        }
    };

    /**
     * Utility per reinizializzare completamente le animazioni di un componente
     * @param {Function} setupFn - Funzione che imposta le animazioni
     * @param {Function} cleanupFn - Funzione che pulisce le animazioni
     */
    const reinitializeComponent = (setupFn, cleanupFn = null) => {
        if (typeof window === "undefined") return;

        // Se c'è una funzione di pulizia, chiamala prima
        if (cleanupFn && typeof cleanupFn === 'function') {
            cleanupFn();
        }

        // Piccolo ritardo per assicurarsi che il DOM sia pronto
        setTimeout(() => {
            if (setupFn && typeof setupFn === 'function') {
                setupFn();

                // Refresh ScrollTrigger dopo l'inizializzazione
                setTimeout(() => {
                    refresh();
                }, 50);
            }
        }, 100);
    };

    return {
        createContext,
        registerTrigger,
        cleanup,
        refresh,
        resetScroll,
        reinitializeComponent
    };
} 