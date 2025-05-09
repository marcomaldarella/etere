"use client";

import React from "react";
import { useContent } from "@/context/ContentContext";
import "./Services.css";

export default function Services() {
  const { services } = useContent();

  return (
    <section className="services">
      <div className="services-entry">
        <h2 className="servicesTitle">{services.header}</h2>
        <p className="servicesDescription">{services.description}</p>
      </div>

      <div className="servicesList">
        {services.items.map((item, idx) => (
          <div className="serviceItem" key={idx}>
            <div className="serviceLeft">{item.title}</div>
            <div className="serviceCenter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="2" />
              </svg>
            </div>
            <div className="serviceRight">
              <div className="serviceDescription">{item.description}</div>
              <div className="serviceIndex">
                {String(idx + 1).padStart(2, "0")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
