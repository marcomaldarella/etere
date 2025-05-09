import { TextSplitter } from "./TextSplitter";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export class BlurScrollEffect {
  constructor(el) {
    if (!el) throw new Error("Element required");
    this.el = el;
    this.splitter = null;
    this.scrollTrigger = null;
    this.animation = null;
    this._hasStarted = false;

    this.waitForSplashAndBuild();
  }

  waitForSplashAndBuild() {
    const tryInit = () => {
      if (!document.body.contains(this.el)) {
        requestAnimationFrame(tryInit);
        return;
      }

      if (window.isSplashActive) {
        setTimeout(tryInit, 100);
        return;
      }

      this.build();
    };

    tryInit();
  }

  build() {
    if (this._hasStarted) return;
    this._hasStarted = true;

    this.splitter = new TextSplitter(this.el, {
      split: "words, chars",
      resize: () => {
        this.destroy();
        this.build();
        ScrollTrigger.refresh();
      },
    });

    this.createAnimation();
  }

  createAnimation() {
    const chars = this.splitter.getChars?.() || this.splitter.chars;
    if (!chars || chars.length === 0) return;

    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.el,
      start: "top bottom-=15%",
      end: "bottom center+=15%",
      scrub: true,
      id: `blur-effect-${Date.now()}`,
      onUpdate: (self) => {
        // Reset manuale per sicurezza quando si torna in cima
        if (self.progress < 0.001) {
          gsap.set(chars, {
            scaleY: 0.1,
            scaleX: 1.8,
            filter: "blur(12px) brightness(40%)",
          });
        }
      },
    });

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
      }
    );
  }

  destroy() {
    if (this.animation) {
      this.animation.kill();
      this.animation = null;
    }
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
      this.scrollTrigger = null;
    }
    if (this.splitter) {
      this.splitter.destroy();
      this.splitter = null;
    }
    this._hasStarted = false;
  }
}
