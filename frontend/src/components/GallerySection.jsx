import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiX,
  FiGrid,
  FiSliders,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import SectionHeading from './ui/SectionHeading';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

const GALLERY_ITEMS = [
  {
    id: 1,
    src: '/gallery/img1.jpg',
    title: 'High-End Portrait & Beauty Retouch',
    category: 'Photo Editing',
    description: 'Precision skin retouching, color correction, and studio lighting balance.'
  },
  {
    id: 2,
    src: '/gallery/img2.jpg',
    title: 'Real Estate HDR Enhancement',
    category: 'Real Estate',
    description: 'Multi-exposure blending, window pull techniques, and natural warm tones.'
  },
  {
    id: 3,
    src: '/gallery/img3.jpg',
    title: 'Commercial Product Staging',
    category: 'E-Commerce',
    description: 'Flawless background isolation, reflection management, and crisp detailing.'
  },
  {
    id: 4,
    src: '/gallery/img4.jpg',
    title: 'Cinematic Color Grading',
    category: 'Video & Media',
    description: 'Rich dynamic range grading and atmosphere enhancement for visual media.'
  },
  {
    id: 5,
    src: '/gallery/img5.jpg',
    title: 'Architectural Exterior Transformation',
    category: 'Real Estate',
    description: 'Lawn greening, sky replacement, and perspective correction.'
  },
  {
    id: 6,
    src: '/gallery/img6.jpg',
    title: 'Studio Fashion & Editorial',
    category: 'Photo Editing',
    description: 'Vibrant color pop, high-fashion tone matching, and hair/skin cleanup.'
  },
  {
    id: 7,
    src: '/gallery/img7.jpg',
    title: 'Creative Digital Manipulation',
    category: 'Studio Showcase',
    description: 'Advanced compositing, surreal lighting FX, and artistic element blending.'
  },
  {
    id: 8,
    src: '/gallery/img8.jpg',
    title: 'Landscape & Sky Replacement',
    category: 'Photo Editing',
    description: 'Dramatic sunset sky integration with harmonized environmental lighting.'
  },
  {
    id: 9,
    src: '/gallery/img9.jpg',
    title: 'E-Commerce Apparel Touchup',
    category: 'E-Commerce',
    description: 'Ghost mannequin alignment, wrinkle smoothing, and accurate fabric colors.'
  },
  {
    id: 10,
    src: '/gallery/img10.jpg',
    title: 'Day to Twilight Conversion',
    category: 'Real Estate',
    description: 'Warm interior light activation, dusk sky blending, and luxury ambiance.'
  },
  {
    id: 11,
    src: '/gallery/img11.jpg',
    title: 'Luxury Interior Color Harmony',
    category: 'Real Estate',
    description: 'Balanced shadows, high-detail texture recovery, and ambient light tuning.'
  },
  {
    id: 12,
    src: '/gallery/img12.jpg',
    title: 'Editorial Magazine Cover Edit',
    category: 'Studio Showcase',
    description: 'Magazine-ready polish, sharp contrast ratios, and master tone curves.'
  },
  {
    id: 13,
    src: '/gallery/img13.jpg',
    title: 'Brand Commercial Visual Asset',
    category: 'Video & Media',
    description: 'High-impact promotional media asset crafted for enterprise campaigns.'
  }
];

const CATEGORIES = ['All', 'Photo Editing', 'Real Estate', 'E-Commerce', 'Studio Showcase', 'Video & Media'];

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const autoPlayRef = useRef(null);

  // Filter items based on active category
  const filteredItems = activeCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Autoplay loop for carousel
  useEffect(() => {
    if (isPlaying && viewMode === 'carousel' && filteredItems.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPlaying, viewMode, filteredItems.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  // Keyboard controls for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowRight') {
        const currentModalIdx = filteredItems.findIndex(item => item.id === selectedImage.id);
        const nextIdx = (currentModalIdx + 1) % filteredItems.length;
        setSelectedImage(filteredItems[nextIdx]);
      }
      if (e.key === 'ArrowLeft') {
        const currentModalIdx = filteredItems.findIndex(item => item.id === selectedImage.id);
        const prevIdx = currentModalIdx === 0 ? filteredItems.length - 1 : currentModalIdx - 1;
        setSelectedImage(filteredItems[prevIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredItems]);

  return (
    <section id="gallery" className="py-24 lg:py-32 bg-slate-900 text-white relative overflow-hidden transition-colors border-t border-b border-slate-800">
      {/* Background Glow Deco */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        {/* Section Header */}
        <SectionHeading
          badge="Portfolio Showcase"
          badgeAccent="emerald"
          title="Explore Our Creative Gallery"
          titleHighlight="Creative Gallery"
          subtitle="Take a look at our latest visual editing masterpieces, real estate enhancements, and studio projects delivered for clients worldwide."
        />

        {/* Filter Controls & View Mode Toggle */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('carousel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'carousel' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiSliders className="w-3.5 h-3.5" />
                Carousel
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FiGrid className="w-3.5 h-3.5" />
                Grid
              </button>
            </div>

            {/* Play/Pause Autoplay (Carousel mode) */}
            {viewMode === 'carousel' && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause Autoplay' : 'Play Autoplay'}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                {isPlaying ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* CAROUSEL VIEW */}
        {viewMode === 'carousel' && (
          <div
            className="mt-10 relative"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            {/* Slide Container */}
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 p-4 md:p-6 backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map((offset) => {
                  const itemIndex = (currentIndex + offset) % filteredItems.length;
                  const item = filteredItems[itemIndex];
                  if (!item) return null;

                  return (
                    <motion.div
                      key={`${item.id}-${offset}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className={`group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-500 shadow-lg ${
                        offset !== 0 ? 'hidden md:block' : ''
                      } ${offset === 2 ? 'hidden lg:block' : ''}`}
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                        <img
                          src={item.src}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Category Badge Top Left */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-3 py-1 text-[11px] font-semibold tracking-wider text-cyan-300 bg-slate-900/80 backdrop-blur-md rounded-lg border border-cyan-500/30">
                            {item.category}
                          </span>
                        </div>

                        {/* Zoom Button Center */}
                        <button
                          onClick={() => setSelectedImage(item)}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg hover:bg-cyan-400 z-20"
                          title="View Full Image"
                        >
                          <FiMaximize2 className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Details Content */}
                      <div className="p-5">
                        <h4 className="font-display font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Arrows & Progress */}
            <div className="mt-8 flex items-center justify-between">
              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {filteredItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx
                        ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="w-11 h-11 rounded-xl bg-slate-800 text-white flex items-center justify-center border border-slate-700 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all duration-300 shadow-md"
                  title="Previous Slide"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-11 h-11 rounded-xl bg-slate-800 text-white flex items-center justify-center border border-slate-700 hover:bg-cyan-500 hover:text-slate-950 hover:border-cyan-400 transition-all duration-300 shadow-md"
                  title="Next Slide"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            animate="show"
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-lg cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-900 relative">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                    <span className="self-start px-2.5 py-1 text-[10px] font-bold text-cyan-300 bg-slate-900/90 rounded-md border border-cyan-500/30">
                      {item.category}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
              onClick={() => setSelectedImage(null)}
            >
              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-30 p-3 rounded-full bg-slate-950/80 text-white hover:bg-red-500 hover:text-white transition-colors border border-slate-700"
                  title="Close Modal"
                >
                  <FiX className="w-5 h-5" />
                </button>

                {/* Modal Image Area */}
                <div className="relative bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    className="max-h-[70vh] w-auto object-contain mx-auto"
                  />
                </div>

                {/* Modal Footer Description */}
                <div className="p-6 md:p-8 bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-md">
                        {selectedImage.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Asset #{selectedImage.id} of {GALLERY_ITEMS.length}
                      </span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-white mt-2">
                      {selectedImage.title}
                    </h3>
                    <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                      {selectedImage.description}
                    </p>
                  </div>

                  {/* Contact CTA in Modal */}
                  <Button
                    to="/contact"
                    variant="primary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setSelectedImage(null)}
                  >
                    Request Similar Edit
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
