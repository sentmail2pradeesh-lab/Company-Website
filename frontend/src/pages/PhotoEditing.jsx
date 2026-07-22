import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const services = [
  {
    title: 'Single Image',
    text: 'Our Single Image Editing Service transforms ordinary photos into stunning visuals. We enhance colors, adjust lighting, remove imperfections, and optimize every detail to make your images stand out. Perfect for real estate, e-commerce, and professional portfolios.',
    before: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d7046?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500&q=80',
    reverse: false,
  },
  {
    title: 'HDR Photo',
    text: 'High Dynamic Range editing combines multiple exposures to create perfectly balanced images. We bring out details in both shadows and highlights, delivering vibrant, true-to-life photos that capture every nuance of your property or product.',
    before: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80',
    reverse: true,
  },
  {
    title: 'Twilight Image',
    text: 'Transform daytime exterior shots into captivating twilight scenes. Our twilight editing creates a warm, inviting ambiance that makes properties look luxurious and appealing, perfect for real estate marketing that demands attention.',
    before: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80',
    reverse: false,
  },
  {
    title: 'Virtual Staging',
    text: 'Empty rooms become beautifully furnished spaces with our AI-driven virtual staging. We digitally add furniture, decor, and styling to help buyers envision the full potential of any property — faster and more cost-effective than physical staging.',
    before: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80',
    after: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80',
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

export default function PhotoEditing() {
  return (
    <div className="page">
      <Navbar />
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Photo Editing
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
