"use client";

import { usePathname, useRouter } from "next/navigation";
import "./Navbar.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  const handleNavigation = (event, sectionId) => {
    event.preventDefault();

    if (typeof window === "undefined") return;

    const el = document.getElementById(sectionId);

    if (isHomePage && typeof window !== "undefined" && window.lenis && el) {
      window.lenis.scrollTo(el, { offset: 0, duration: 1.5 });
    } else {
      router.push(`/#${sectionId}`);
      setTimeout(() => {
        const tryScroll = () => {
          if (typeof window === "undefined") return;

          const el = document.getElementById(sectionId);
          if (el && typeof window !== "undefined" && window.lenis) {
            window.lenis.scrollTo(el, { offset: 0, duration: 1.5 });
          } else {
            requestAnimationFrame(tryScroll);
          }
        };
        tryScroll();
      }, 400);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();

    if (typeof window === "undefined") return;

    if (isHomePage) {
      if (typeof window !== "undefined" && window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2 });
      }

      if (typeof window !== "undefined") {
        requestAnimationFrame(() => {
          if (typeof window !== "undefined" && window.ScrollTrigger) {
            window.ScrollTrigger.getAll().forEach(t => t.kill());
            window.ScrollTrigger.refresh(true);
          }
        });
      }
    } else {
      router.push("/");
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-col">
        <div className="navbar-sub-col logo">
          <a href="/" onClick={handleLogoClick} className="logo-link">
            <img
              src="/images/home/logos/etere-logo.svg"
              alt="Etere Logo"
              className="logo-img"
            />
          </a>
        </div>
      </div>

      <div className="navbar-col">
        <div className="navbar-sub-col nav-items">
          <a href="/projects"><p>Projects</p></a>
          <a href="#about" onClick={(e) => handleNavigation(e, "about")}><p>About</p></a>
          <a href="#contact" onClick={(e) => handleNavigation(e, "contact")}><p>Contact</p></a>
        </div>
      </div>
    </div>
  );
}
