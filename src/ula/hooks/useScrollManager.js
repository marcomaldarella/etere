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

    // Initialize on component mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);

        return () => cleanup();
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
        if (typeof window === "undefined") return;

        console.log("🧹 Cleaning up ScrollTrigger instances");

        // Kill all tracked triggers
        if (triggersRef.current.length) {
            triggersRef.current.forEach(trigger => {
                if (trigger && trigger.kill) {
                    trigger.kill();
                }
            });
            triggersRef.current = [];
        }

        // Kill all ScrollTrigger instances for safety
        ScrollTrigger.getAll().forEach(trigger => {
            trigger.kill();
        });

        // Clear the context
        if (contextRef.current) {
            contextRef.current.revert();
            contextRef.current = null;
        }

        // Clear any lingering animations
        gsap.globalTimeline.clear();

        // Try to clear ScrollTrigger memory
        if (ScrollTrigger.clearScrollMemory) {
            ScrollTrigger.clearScrollMemory();
        }

        console.log("✅ Cleanup complete");
    };

    /**
     * Refresh ScrollTrigger after DOM changes
     */
    const refresh = () => {
        if (typeof window === "undefined") return;

        ScrollTrigger.refresh(true);
    };

    return {
        createContext,
        registerTrigger,
        cleanup,
        refresh
    };
} 