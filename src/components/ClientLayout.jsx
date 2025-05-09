"use client";

import Providers from "@/components/Providers";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import Splash from "@/components/Splash/Splash";

export default function ClientLayout({ children }) {
    return (
        <div suppressHydrationWarning={true}>
            <Providers>
                <Splash />

                <PageWrapper>{children}</PageWrapper>
            </Providers>
        </div>
    );
}
