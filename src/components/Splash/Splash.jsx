"use client";

import { useEffect, useState } from "react";
import { useTransition } from "@/components/PageWrapper/PageWrapper";
import "./Splash.css";

export default function Splash() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const { isTransitioning } = useTransition();

  useEffect(() => {
    if (!isTransitioning) {
      const fade = setTimeout(() => {
        setFadeOut(true);
      }, 2000);

      const hide = setTimeout(() => {
        setVisible(false);

        // ✅ Segna splash come già mostrata e lancia evento globale
        window.splashAlreadyDone = true;
        window.dispatchEvent(new Event("splashCompleted"));
      }, 3000);

      return () => {
        clearTimeout(fade);
        clearTimeout(hide);
      };
    } else {
      setVisible(true);
      setFadeOut(false);
    }
  }, [isTransitioning]);

  if (!visible) return null;

  return (
    <div id="splash">
      <div className={`splash-box ${fadeOut ? "fade-out" : ""}`}>
        <img src="/images/logos/eterestudio-01.svg" alt="1" className="splash-logo delay-1" />
        <img src="/images/logos/eterestudio-02.svg" alt="2" className="splash-logo delay-2" />
        <img src="/images/logos/eterestudio-03.svg" alt="3" className="splash-logo delay-3" />
      </div>
    </div>
  );
}
