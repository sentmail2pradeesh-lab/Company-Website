import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  const { pathname, hash } = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    const isDashboard = pathname.startsWith('/dashboard');

    if (isDashboard) {
      // In dashboard routes: destroy Lenis so native scrolling works 100% smoothly
      if (window.lenis) {
        try {
          window.lenis.destroy();
        } catch (e) {}
        delete window.lenis;
      }
      if (lenisRef.current) {
        try {
          lenisRef.current.destroy();
        } catch (e) {}
        lenisRef.current = null;
      }
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
      document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
      document.documentElement.style.overflowY = '';
      document.documentElement.style.overflowX = '';
      document.body.style.overflowY = '';
      document.body.style.overflowX = '';
      return;
    }

    // Public website pages: initialize Lenis smooth scrolling
    if (!lenisRef.current) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;
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
        lenisRef.current = null;
        delete window.lenis;
      };
    }
  }, [pathname]);

  useEffect(() => {
    if (lenisRef.current) {
      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          lenisRef.current.scrollTo(el, { offset: -80, duration: 1.2 });
        }
      } else {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return children;
}
