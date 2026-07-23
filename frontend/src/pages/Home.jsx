import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const serviceCards = [
  {
    image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8e6?w=600&q=80',
    caption: 'Professional photo editing to enhance your images and elevate your brand.',
    link: '/photo-editing',
    title: 'Photo Editing',
  },
  {
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
    caption: 'Cinematic video editing tailored for real estate, corporate, and social media.',
    link: '/video-editing',
    title: 'Video Editing',
  },
  {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    caption: 'Innovative software solutions and digital marketing that drive measurable growth.',
    link: '/software-development',
    title: 'Software & Marketing',
  },
];

export default function Home() {
  return (
    <div className="page">
      <Navbar transparent />

      <div className="hero-section-wrapper">
        <Hero />

        <section id="services" className="home-cards">
          {serviceCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link to={card.link} className="home-card">
                <div className="home-card__image">
                  <img src={card.image} alt={card.title} loading="lazy" />
                  <div className="home-card__overlay">
                    <span className="home-card__tag">{card.title}</span>
                  </div>
                </div>
                <p className="home-card__caption">{card.caption}</p>
              </Link>
            </motion.div>
          ))}
        </section>
      </div>

      <section id="about" className="about-section">
        <div className="about-container">
          <motion.div
            className="about-content"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="about-badge">About ASZEN</span>
            <h2 className="about-title">Transforming Businesses Through Technology & Creativity</h2>
            <p className="about-text">
              ASZEN Technologies Pvt. Ltd. is a full-service digital solutions company specializing
              in photo editing, video production, software development, and digital marketing.
              We partner with real estate agencies, e-commerce brands, and enterprises worldwide
              to deliver high-quality, scalable services.
            </p>
            <p className="about-text">
              With a dedicated team of editors, developers, and marketing strategists, we combine
              technical expertise with creative excellence — ensuring every project meets the highest
              standards of quality, speed, and reliability.
            </p>
            <div className="about-highlights">
              {['Photo & Video Editing', 'Software Development', 'Digital Marketing'].map(
                (item) => (
                  <span key={item} className="about-highlight">
                    {item}
                  </span>
                )
              )}
            </div>
          </motion.div>

          <motion.div
            className="about-image-wrap"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
              alt="ASZEN Technologies team workspace"
              className="about-image"
              loading="lazy"
            />
            <div className="about-image-accent" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
