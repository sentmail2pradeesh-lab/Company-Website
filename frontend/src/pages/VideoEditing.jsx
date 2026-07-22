import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const services = [
  {
    title: 'Color Grading',
    text: 'Professional color grading that sets the mood and tone of your footage. We enhance skin tones, balance exposure, and create cinematic looks that elevate your brand and storytelling.',
    before: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&q=80',
    reverse: false,
  },
  {
    title: 'Video Stabilization',
    text: 'Shaky footage becomes smooth and professional with our advanced stabilization techniques. Perfect for real estate walkthroughs, event coverage, and action sequences.',
    before: 'https://images.unsplash.com/photo-1536240478700-b869070f927d?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=500&q=80',
    reverse: true,
  },
  {
    title: 'Motion Graphics',
    text: 'Dynamic titles, lower thirds, and animated elements that bring your videos to life. Our motion graphics team creates engaging visuals that reinforce your message and brand identity.',
    before: 'https://images.unsplash.com/photo-1611162616475-46b635cb6848?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&q=80',
    reverse: false,
  },
  {
    title: 'Video Enhancement',
    text: 'From noise reduction to upscaling and HDR conversion, we optimize your footage for any platform. Deliver crisp, vibrant videos optimized for web, social media, and broadcast.',
    before: 'https://images.unsplash.com/photo-1598488035139-bdbb2231bb00?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1579869847514-04c9294ace88?w=500&q=80',
    reverse: true,
  },
];

function BeforeAfter({ before, after }) {
  return (
    <div className="before-after">
      <div className="before-after__item">
        <img src={before} alt="Before editing" />
        <span className="before-after__label">Before</span>
      </div>
      <div className="before-after__item">
        <img src={after} alt="After editing" />
        <span className="before-after__label">After</span>
      </div>
    </div>
  );
}

export default function VideoEditing() {
  return (
    <div className="page">
      <Navbar />
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Video Editing
      </motion.h1>

      <div className="section-container">
        {services.map((service, i) => (
          <motion.div
            key={service.title}
            className="service-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <div
              className={`service-card__grid ${service.reverse ? 'service-card__grid--reverse' : ''}`}
            >
              <BeforeAfter before={service.before} after={service.after} />
              <div>
                <h2 className="service-card__title">{service.title}</h2>
                <p className="service-card__text">{service.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
