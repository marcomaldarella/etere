"use client";

import React, { createContext, useContext, useState } from "react";
import content from "../../data/content.json";

const ContentContext = createContext();

export function ContentProvider({ children }) {
    const [reset, setReset] = useState(false);

    // Add fallbacks to prevent undefined errors
    const services = content?.services || {};
    const home = content?.home || {};
    const projects = content?.projects || [];

    return (
        <ContentContext.Provider value={{ reset, setReset, services, home, projects }}>
            {children}
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error("useContent must be used within a ContentProvider");
    }
    return context;
}
