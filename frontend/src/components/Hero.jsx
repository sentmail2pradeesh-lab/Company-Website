
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { staggerContainer, fadeUp, Float } from '../lib/motion';

export default function Hero() {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yVisual = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section ref={ref} className="relative overflow-hidden pt-36 lg:pt-40 pb-20 lg:pb-32 bg-obsidian transition-colors">
      {/* Background Video */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover opacity-25 dark:opacity-40 scale-105 will-change-transform"
        >
          <source src="/hero-reel.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/90 via-obsidian/75 to-obsidian backdrop-blur-[2px]" />
      </div>

      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[550px] h-[550px] blob-royal -z-10 opacity-60 pointer-events-none" />
      <div className="absolute top-48 -left-32 w-[480px] h-[480px] blob-emerald -z-10 opacity-50 pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] blob-violet -z-10 opacity-40 pointer-events-none" />

      <motion.div style={{ opacity }} className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left column */}
        <motion.div variants={staggerContainer(0.14)} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-400 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Creative Digital Studio
          </motion.div>

          <motion.h1 variants={fadeUp} className="mt-5 font-display text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-extrabold tracking-tight text-ink">
            Creative digital solutions that{' '}
            <span className="text-gradient-brand">move brands forward</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base md:text-lg text-mist leading-relaxed font-normal">
            From pixel-perfect photo and video editing to high-growth marketing and custom software — Vista Editz crafts premium creative work for real estate, e-commerce, agencies and enterprises.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="primary" onClick={() => navigate('/contact')} iconRight="arrowRight">
              Start Your Project
            </Button>
            <Button
              size="lg"
              variant="outline"
              iconLeft="play"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Work
            </Button>
          </motion.div>
        </motion.div>

        {/* Right column — Cinematic Video Reel Stage */}
        <motion.div style={{ y: yVisual }} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="relative will-change-transform">
          {/* Main Video Monitor Stage */}
          <div className="relative rounded-[2.5rem] overflow-hidden glass-card shadow-float border border-line p-2.5">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-950">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="h-full w-full object-cover opacity-90 scale-105"
              >
                <source src="/hero-reel.mp4" type="video/mp4" />
              </video>

              {/* Video Overlay Top Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/70 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  STUDIO REEL 2026
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 backdrop-blur-md px-3 py-1 text-[0.7rem] font-bold uppercase text-cyan-300 border border-cyan-500/30">
                  4K HDR Master
                </span>
              </div>

              {/* Center Play/Pause Control Button */}
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-2xl border border-white/40 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                aria-label={isPlaying ? 'Pause studio reel' : 'Play studio reel'}
              >
                <Icon name={isPlaying ? 'close' : 'play'} className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>

              {/* Video Bottom HUD Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-slate-950/80 backdrop-blur-xl px-4 py-2.5 border border-white/15">
                <div className="flex items-center gap-3">
                  <div className="flex items-end gap-1 h-5 w-6">
                    <span className="w-1 bg-indigo-500 rounded-full animate-audio-1" />
                    <span className="w-1 bg-cyan-400 rounded-full animate-audio-2" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-audio-3" />
                    <span className="w-1 bg-blue-500 rounded-full animate-audio-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">Vista Edits Reel</p>
                    <p className="text-[0.68rem] text-slate-400 font-mono mt-0.5">3840x2160 • 60FPS • Color Graded</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono">LIVE</span>
              </div>
            </div>
          </div>

          {/* Floating Feature Badges around Video */}
          <Float distance={14} duration={5} className="absolute -left-6 top-1/4 hidden sm:block">
            <div className="flex items-center gap-3 rounded-2xl p-3 pr-5 shadow-float border border-line glass-card backdrop-blur-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-glow">
                <Icon name="film" className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-ink leading-tight">Video Production</p>
                <p className="text-[0.7rem] text-mist mt-0.5 font-bold">Color graded · FX</p>
              </div>
            </div>
          </Float>

          <Float distance={12} duration={6} delay={0.5} className="absolute -right-4 top-8 hidden sm:block">
            <div className="rounded-2xl p-4 shadow-float border border-line glass-card backdrop-blur-xl w-48">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink">Growth Rate</span>
                <span className="text-[0.7rem] font-bold text-emerald-400">+3x ROI</span>
              </div>
              <div className="flex items-end gap-1.5 h-12">
                {[35, 50, 45, 70, 65, 95].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 via-cyan-400 to-emerald-400"
                  />
                ))}
              </div>
            </div>
          </Float>

          <Float distance={10} duration={5.5} delay={1} className="absolute -bottom-5 left-8 hidden sm:block">
            <div className="flex items-center gap-2 rounded-2xl bg-obsidian-card border border-line text-ink px-4 py-3 shadow-float font-mono text-xs backdrop-blur-xl">
              <span className="text-cyan-400 font-bold">const</span>
              <span className="text-emerald-400 font-bold">studio</span>
              <span className="text-mist">=</span>
              <span className="text-indigo-400 font-bold">'premium'</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 ml-1 animate-pulse" />
            </div>
          </Float>

          <Float distance={13} duration={6.5} delay={0.3} className="absolute bottom-12 -right-6 hidden md:block">
            <div className="flex items-center gap-2.5 rounded-full glass-card pl-2.5 pr-4 py-2 shadow-float border border-line backdrop-blur-xl">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold">
                <Icon name="shield" className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-ink">Delivered in 24h</span>
            </div>
          </Float>
        </motion.div>
      </motion.div>
    </section>
  );
}