// import { TRUSTED_CLIENTS } from '../lib/data';
// import { fadeUp, viewportOnce } from '../lib/motion';
// import { motion } from 'framer-motion';

// export default function TrustedClients() {
//   const items = [...TRUSTED_CLIENTS, ...TRUSTED_CLIENTS];

//   return (
//     <section className="py-12 lg:py-16 border-y border-line bg-white">
//       <div className="mx-auto max-w-7xl px-6">
//         <motion.p
//           variants={fadeUp}
//           initial="hidden"
//           whileInView="show"
//           viewport={viewportOnce}
//           className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-mist"
//         >
//           Trusted by leading brands worldwide
//         </motion.p>

//         <div className="relative mt-8 overflow-hidden mask-fade-x">
//           <div className="flex w-max animate-marquee pause-on-hover items-center gap-12">
//             {items.map((name, i) => (
//               <span
//                 key={i}
//                 className="font-display text-xl md:text-2xl font-bold tracking-tight text-slate/55 hover:text-royal transition-colors whitespace-nowrap"
//               >
//                 {name}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
