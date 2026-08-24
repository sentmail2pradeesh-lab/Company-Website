import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    window.lenis = lenis;

    let reqId;
    function raf(time) {
      lenis.raf(time);
      reqId = requestAnimationFrame(raf);
    }
    reqId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  useEffect(() => {
    if (window.lenis) {
      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          window.lenis.scrollTo(el, { offset: -80, duration: 1.2 });
        }
      } else {
        window.lenis.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname, hash]);

  return children;
}
