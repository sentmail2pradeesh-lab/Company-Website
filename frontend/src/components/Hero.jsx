import { motion } from 'framer-motion';
import Button from './Button';
import './components.css';

const HERO_VIDEO = '/videos/hero-video.mp4';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export default function Hero() {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="hero__video-wrap">
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      </div>
      <div className="hero__overlay" />

      <motion.div
        className="hero__content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="hero__quote" variants={itemVariants}>
          &ldquo;Crafting Software Solutions with Precision&rdquo;
        </motion.h1>
        <motion.p className="hero__subtitle" variants={itemVariants}>
          Transform your business globally with our photo editing, video production, software, and digital marketing services
        </motion.p>
        <motion.div variants={itemVariants}>
          <Button variant="ghost" className="hero__cta" onClick={scrollToServices}>
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}
