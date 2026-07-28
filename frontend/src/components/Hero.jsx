// import { motion, useScroll, useTransform } from 'framer-motion';
// import { useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Button from './ui/Button';
// import Icon from './ui/Icon';
// import BeforeAfterSlider from './BeforeAfterSlider';
// import { staggerContainer, fadeUp, Float } from '../lib/motion';

// const avatars = [
//   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
//   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
//   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
//   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
// ];

// export default function Hero() {
//   const ref = useRef(null);
//   const navigate = useNavigate();
//   const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
//   const yVisual = useTransform(scrollYProgress, [0, 1], [0, 80]);
//   const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

//   return (
//     <section ref={ref} className="relative overflow-hidden pt-28 lg:pt-32 pb-16 lg:pb-24">
//       <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
//       <div className="absolute -top-24 -right-24 w-[480px] h-[480px] blob-royal -z-10" />
//       <div className="absolute top-40 -left-32 w-[420px] h-[420px] blob-emerald -z-10" />

//       <motion.div style={{ opacity }} className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
//         {/* Left column */}
//         <motion.div variants={staggerContainer(0.14)} initial="hidden" animate="show">
//           <motion.div variants={fadeUp}>
//             {/* <span className="inline-flex items-center gap-2 rounded-full border border-emerald/25 bg-emerald-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald">
//               <span className="flex h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
//               Trusted by 500+ brands worldwide
//             </span> */}
//           </motion.div>

//           <motion.h1 variants={fadeUp} className="mt-5 font-display text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-extrabold tracking-tight text-ink">
//             Creative digital solutions that{' '}
//             <span className="text-gradient-brand">move brands forward</span>
//           </motion.h1>

//           <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base md:text-lg text-mist leading-relaxed">
//             From pixel-perfect photo and video editing to high-growth marketing and custom software — Vista Edits crafts premium creative work for real estate, e-commerce, agencies and enterprises.
//           </motion.p>

//           <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
//             <Button size="lg" onClick={() => navigate('/contact')} iconRight="arrowRight">
//               Start Your Project
//             </Button>
//             <Button size="lg" variant="outline" iconLeft="play" onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
//               Explore Work
//             </Button>
//           </motion.div>

//           <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-5">
//             <div className="flex -space-x-3">
//               {avatars.map((a, i) => (
//                 <img key={i} src={a} alt="" loading="lazy" className="h-10 w-10 rounded-full border-2 border-cream object-cover" />
//               ))}
//             </div>
//             <div>
//               <div className="flex items-center gap-1 text-emerald">
//                 {[...Array(5)].map((_, i) => (
//                   <Icon key={i} name="star" className="w-4 h-4" />
//                 ))}
//               </div>
//               <p className="mt-0.5 text-sm text-mist">
//                 <span className="font-semibold text-ink">4.9/5</span> from 200+ reviews
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>

//         {/* Right column — visual composition */}
//         <motion.div style={{ y: yVisual }} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="relative">
//           <div className="relative rounded-3xl bg-white p-3 shadow-float border border-line">
//             <BeforeAfterSlider
//               before="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
//               after="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
//               className="aspect-[4/3]"
//               rounded="rounded-2xl"
//             />
//             <div className="flex items-center justify-between px-2 py-3">
//               <div className="flex items-center gap-2">
//                 <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal-50 text-royal">
//                   <Icon name="photo" className="w-3.5 h-3.5" />
//                 </span>
//                 <span className="text-sm font-semibold text-ink">Real Estate Retouch</span>
//               </div>
//               <span className="text-xs font-medium text-emerald">+38% CTR</span>
//             </div>
//           </div>

//           <Float distance={14} duration={5} className="absolute -left-6 top-1/4 hidden sm:block">
//             <div className="flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-float border border-line">
//               <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-sky text-white">
//                 <Icon name="play" className="w-4 h-4" />
//               </span>
//               <div>
//                 <p className="text-xs font-semibold text-ink leading-tight">Video Edit</p>
//                 <p className="text-[0.7rem] text-mist">Color graded · 4K</p>
//               </div>
//             </div>
//           </Float>

//           <Float distance={12} duration={6} delay={0.5} className="absolute -right-4 top-8 hidden sm:block">
//             <div className="rounded-2xl bg-white p-3.5 shadow-float border border-line w-44">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-xs font-semibold text-ink">Marketing</span>
//                 <span className="text-[0.7rem] font-semibold text-emerald">+3x ROI</span>
//               </div>
//               <div className="flex items-end gap-1 h-12">
//                 {[35, 50, 45, 70, 60, 88].map((h, i) => (
//                   <motion.div
//                     key={i}
//                     initial={{ height: 0 }}
//                     animate={{ height: `${h}%` }}
//                     transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
//                     className="flex-1 rounded-t bg-gradient-to-t from-emerald/40 to-emerald"
//                   />
//                 ))}
//               </div>
//             </div>
//           </Float>

//           <Float distance={10} duration={5.5} delay={1} className="absolute -bottom-5 left-8 hidden sm:block">
//             <div className="flex items-center gap-2 rounded-xl bg-ink text-white px-3.5 py-2.5 shadow-float font-mono text-xs">
//               <span className="text-sky">const</span>
//               <span className="text-emerald">app</span>
//               <span className="text-white/60">=</span>
//               <span className="text-sky">'premium'</span>
//               <span className="flex h-2 w-2 rounded-full bg-emerald ml-1 animate-pulse" />
//             </div>
//           </Float>

//           <Float distance={13} duration={6.5} delay={0.3} className="absolute bottom-12 -right-6 hidden md:block">
//             <div className="flex items-center gap-2 rounded-full bg-white pl-2 pr-4 py-2 shadow-float border border-line">
//               <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald text-white">
//                 <Icon name="shield" className="w-3.5 h-3.5" />
//               </span>
//               <span className="text-xs font-semibold text-ink">Delivered in 24h</span>
//             </div>
//           </Float>
//         </motion.div>
//       </motion.div>
//     </section>
//   );
// }


import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Icon from './ui/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { staggerContainer, fadeUp, Float } from '../lib/motion';

export default function Hero() {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yVisual = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 lg:pt-32 pb-16 lg:pb-24">
      {/* Background Video */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Backdrop tint to maintain high text contrast */}
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]" />
      </div>

      <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] blob-royal -z-10 opacity-70 pointer-events-none" />
      <div className="absolute top-40 -left-32 w-[420px] h-[420px] blob-emerald -z-10 opacity-70 pointer-events-none" />

      <motion.div style={{ opacity }} className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left column */}
        <motion.div variants={staggerContainer(0.14)} initial="hidden" animate="show">
          <motion.h1 variants={fadeUp} className="mt-5 font-display text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-extrabold tracking-tight text-ink">
            Creative digital solutions that{' '}
            <span className="text-gradient-brand">move brands forward</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base md:text-lg text-mist leading-relaxed">
            From pixel-perfect photo and video editing to high-growth marketing and custom software — Vista Edits crafts premium creative work for real estate, e-commerce, agencies and enterprises.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate('/contact')} iconRight="arrowRight">
              Start Your Project
            </Button>
            <Button size="lg" variant="outline" iconLeft="play" onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Work
            </Button>
          </motion.div>
        </motion.div>

        {/* Right column — visual composition */}
        <motion.div style={{ y: yVisual }} variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.2 }} className="relative">
          <div className="relative rounded-3xl bg-white p-3 shadow-float border border-line">
            <BeforeAfterSlider
              before="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
              after="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
              className="aspect-[4/3]"
              rounded="rounded-2xl"
            />
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal-50 text-royal">
                  <Icon name="photo" className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-semibold text-ink">Real Estate Retouch</span>
              </div>
              <span className="text-xs font-medium text-emerald">+38% CTR</span>
            </div>
          </div>

          <Float distance={14} duration={5} className="absolute -left-6 top-1/4 hidden sm:block">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-float border border-line">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-sky text-white">
                <Icon name="play" className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink leading-tight">Video Edit</p>
                <p className="text-[0.7rem] text-mist">Color graded · 4K</p>
              </div>
            </div>
          </Float>

          <Float distance={12} duration={6} delay={0.5} className="absolute -right-4 top-8 hidden sm:block">
            <div className="rounded-2xl bg-white p-3.5 shadow-float border border-line w-44">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-ink">Marketing</span>
                <span className="text-[0.7rem] font-semibold text-emerald">+3x ROI</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {[35, 50, 45, 70, 60, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-emerald/40 to-emerald"
                  />
                ))}
              </div>
            </div>
          </Float>

          <Float distance={10} duration={5.5} delay={1} className="absolute -bottom-5 left-8 hidden sm:block">
            <div className="flex items-center gap-2 rounded-xl bg-ink text-white px-3.5 py-2.5 shadow-float font-mono text-xs">
              <span className="text-sky">const</span>
              <span className="text-emerald">app</span>
              <span className="text-white/60">=</span>
              <span className="text-sky">'premium'</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald ml-1 animate-pulse" />
            </div>
          </Float>

          <Float distance={13} duration={6.5} delay={0.3} className="absolute bottom-12 -right-6 hidden md:block">
            <div className="flex items-center gap-2 rounded-full bg-white pl-2 pr-4 py-2 shadow-float border border-line">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald text-white">
                <Icon name="shield" className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold text-ink">Delivered in 24h</span>
            </div>
          </Float>
        </motion.div>
      </motion.div>
    </section>
  );
}