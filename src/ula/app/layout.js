"use client";

import "./globals.css";
import Providers from "@/components/Providers";
import PageWrapper from "@/components/PageWrapper/PageWrapper";

export const metadata = {
    title: "Etere Studio",
    description: "We shape the unseen"
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body suppressHydrationWarning={true}>
                <Providers>
                    <PageWrapper>{children}</PageWrapper>
                </Providers>
            </body>
        </html>
    );
} 