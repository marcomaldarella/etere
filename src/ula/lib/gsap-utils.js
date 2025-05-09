/**
 * GSAP Utilities for managing animations and ScrollTrigger instances
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Store references to all active ScrollTrigger instances
const activeScrollTriggers = new Set()

/**
 * Register a ScrollTrigger instance for tracking
 */
export const registerScrollTrigger = (instance) => {
    if (instance) {
        activeScrollTriggers.add(instance)
    }
}

/**
 * Unregister a ScrollTrigger instance
 */
export const unregisterScrollTrigger = (instance) => {
    if (instance) {
        activeScrollTriggers.delete(instance)
    }
}

/**
 * Kill all registered ScrollTrigger instances and clean up GSAP animations
 */
export const killAllScrollTriggers = async () => {
    if (typeof window === "undefined") return

    try {
        // Register ScrollTrigger if needed
        if (!gsap.plugins?.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger)
        }

        // Kill all ScrollTrigger instances
        ScrollTrigger.getAll().forEach((trigger) => {
            try {
                trigger.kill()
            } catch (e) {
                console.warn("Error killing ScrollTrigger:", e)
            }
        })

        // Clear our tracked instances
        activeScrollTriggers.clear()

        // Clear ScrollTrigger's scroll memory
        if (ScrollTrigger.clearScrollMemory) {
            ScrollTrigger.clearScrollMemory("manual")
        }

        // Reset ScrollTrigger defaults
        ScrollTrigger.defaults({ scroller: null })

        // Clear GSAP animations
        gsap.globalTimeline.clear()

        console.log("Successfully killed all GSAP animations")
    } catch (error) {
        console.error("Error killing GSAP animations:", error)
    }
}

/**
 * Safely refresh ScrollTrigger
 */
export const refreshScrollTrigger = async () => {
    if (typeof window === "undefined") return

    try {
        // Register ScrollTrigger if needed
        if (!gsap.plugins?.ScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger)
        }

        // Refresh ScrollTrigger with a delay to ensure DOM is ready
        setTimeout(() => {
            ScrollTrigger.refresh(true)
            console.log("Successfully refreshed ScrollTrigger")
        }, 100)
    } catch (error) {
        console.error("Error refreshing ScrollTrigger:", error)
    }
}

/**
 * Kills ScrollTrigger instances attached to a specific container
 * @param {HTMLElement} container - The container element to check against
 */
export function killContainerScrollTriggers(container) {
    if (typeof window !== "undefined" && container) {
        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.vars.trigger === container ||
                (trigger.vars.trigger && container.contains(trigger.vars.trigger))) {
                trigger.kill();
            }
        });
    }
}
