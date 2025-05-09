import { TextSplitter } from "./TextSplitter"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

// Register plugin if in browser environment
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Applies a "blur → sharp" effect to an element
 * by splitting text into characters with TextSplitter.
 */
export class BlurScrollEffect {
  constructor(el) {
    if (!el) throw new Error("Element required")
    this.el = el
    this.splitter = null
    this.scrollTrigger = null
    this.animation = null
    this.build()
  }

  build() {
    /* split words → chars */
    this.splitter = new TextSplitter(this.el, {
      split: "words, chars",
      resize: () => {
        // Kill existing ScrollTrigger before refreshing
        if (this.scrollTrigger) {
          this.scrollTrigger.kill()
        }

        // Refresh ScrollTrigger
        ScrollTrigger.refresh()

        // Rebuild the animation
        this.createAnimation()
      },
    })

    this.createAnimation()
  }

  createAnimation() {
    const chars = this.splitter.chars

    // Kill existing animation if it exists
    if (this.animation) {
      this.animation.kill()
    }

    /* Create scroll animation */
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.el,
      start: "top bottom-=15%",
      end: "bottom center+=15%",
      scrub: true,
      id: `blur-effect-${Date.now()}`,
    })

    this.animation = gsap.fromTo(
      chars,
      {
        scaleY: 0.1,
        scaleX: 1.8,
        filter: "blur(12px) brightness(40%)",
      },
      {
        scaleY: 1,
        scaleX: 1,
        filter: "blur(0px) brightness(100%)",
        ease: "none",
        stagger: 0.04,
        scrollTrigger: this.scrollTrigger,
      },
    )
  }

  // Clean up method
  destroy() {
    if (this.animation) {
      this.animation.kill()
    }

    if (this.scrollTrigger) {
      this.scrollTrigger.kill()
    }

    if (this.splitter) {
      this.splitter.destroy()
    }
  }
}
