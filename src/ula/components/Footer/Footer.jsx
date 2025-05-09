"use client";

import Link from "next/link";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* Colonna 1 */}
        <div className="footer-column">
          <h3>Where we are.</h3>
          <p>
            6815 Biscayne BLVD STE<br />
            103132 MIAMI, FL 33138 USA
          </p>
          <h4>Wanna reach out?</h4>
          <p>
            <a href="mailto:pier@eterestudio.co">pier@eterestudio.co</a><br />
            <a href="mailto:giuseppe@eterestudio.co">giuseppe@eterestudio.co</a>
          </p>
        </div>

        {/* Colonna 2 */}
        <div className="footer-column">
          <h3>Site – map</h3>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/service">Service</Link></li>
            <li><Link href="/projects">Projects</Link></li>
            <li><Link href="/sources">Sources</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/talk-with-us">Talk with us</Link></li>
          </ul>
        </div>

        {/* Colonna 3 */}
        <div className="footer-column">
          <h3>Socials</h3>
          <ul>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>

          <h3>Policies</h3>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/cookie">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>All rights are reserved by Etere Studio ©2025</p>
        <div className="footer-bottom-links">
          <Link href="/privacy">Privacy Policy & Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
