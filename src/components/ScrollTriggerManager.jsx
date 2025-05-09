// components/ScrollTriggerManager.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export default function ScrollTriggerManager({ children }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return children;
}
