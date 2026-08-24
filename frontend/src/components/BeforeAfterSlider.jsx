import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
  rounded = 'rounded-2xl',
  initial = 50,
}) {
  const [pos, setPos] = useState(initial);
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const update = useCallback((clientX) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }, []);

  const onDown = (e) => {
    dragging.current = true;
    update(e.clientX ?? e.touches?.[0]?.clientX);
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    update(e.clientX ?? e.touches?.[0]?.clientX);
  };
  const onUp = () => { dragging.current = false; };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden select-none cursor-ew-resize group ${rounded} ${className}`}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={onDown}
      onTouchMove={onMove}
      onTouchEnd={onUp}
    >
      {/* After (base) */}
      <img src={after} alt={afterLabel} className="block w-full h-full object-cover pointer-events-none" draggable="false" loading="lazy" />

      {/* Before (clipped overlay) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
        <img src={before} alt={beforeLabel} className="absolute inset-0 h-full w-full object-cover max-w-none" style={{ width: width ? `${width}px` : '100%' }} draggable="false" loading="lazy" />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 rounded-full bg-ink/55 backdrop-blur-sm px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-emerald/85 backdrop-blur-sm px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white pointer-events-none">
        {afterLabel}
      </span>

      {/* Handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(30,58,138,0.15)] pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-float">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-royal">
            <path d="M9 7L4 12l5 5M15 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
