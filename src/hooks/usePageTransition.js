// src/hooks/usePageTransition.js
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook che genera una chiave univoca per forzare il remount dei componenti durante
 * le transizioni di pagina, e assicura la corretta pulizia di ScrollTrigger.
 */
export function usePageTransition() {
    const pathname = usePathname();
    const [pageKey, setPageKey] = useState(pathname);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip al primo mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Crea una nuova chiave con timestamp per forzare il remount
        setPageKey(`${pathname}-${Date.now()}`);
    }, [pathname]);

    return pageKey;
}
