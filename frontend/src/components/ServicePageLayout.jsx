import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import Button from './Button';
import BeforeAfter from './BeforeAfter';
import StatsSection from './StatsSection';
import { useUI } from '../context/UIContext';

export default function ServicePageLayout({ data, showBeforeAfter = false }) {
  const { openContact } = useUI();

  return (
    <div className="page">
      <Navbar />

      {/* Hero intro */}
      <section className="service-hero">
        <div className="service-hero__inner">
          <motion.div
            className="service-hero__text"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="service-hero__badge">ASZEN Technologies</span>
            <h1 className="service-hero__title">{data.title}</h1>
            <p className="service-hero__headline">{data.headline}</p>
            <p className="service-hero__desc">{data.description}</p>
          </motion.div>
          <motion.div
            className="service-hero__image-wrap"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <img src={data.heroImage} alt={data.title} className="service-hero__image" />
            <div className="service-hero__image-accent" />
          </motion.div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="service-cta">
        <motion.div
          className="service-cta__inner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="service-cta__title">Ready to get started?</h2>
          <p className="service-cta__text">
            Tell us about your project and our team will respond within 24 hours with a tailored proposal.
          </p>
          <Button onClick={() => openContact(data.title)}>Get Started</Button>
        </motion.div>
      </section>

      {/* Client stats */}
      <StatsSection
        stats={data.stats}
        intro="Trusted by businesses worldwide, we combine expertise, quality, and reliability to deliver results that exceed expectations."
      />

      {/* Services list header */}
      <section className="services-list-header">
        <div className="services-list-header__inner">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our {data.title.replace(' Services', '')} Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Explore our comprehensive range of services designed to meet your business needs with precision and professionalism.
          </motion.p>
        </div>
      </section>

      {/* Service cards */}
      <div className="section-container">
        {data.services.map((service, i) => (
          <motion.div
            key={service.title}
            className="service-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
          >
            <div
              className={`service-card__grid ${service.reverse ? 'service-card__grid--reverse' : ''}`}
            >
              {showBeforeAfter && service.before ? (
                <BeforeAfter before={service.before} after={service.after} />
              ) : (
                <div className="service-card__image-only">
                  <img src={service.image} alt={service.title} loading="lazy" />
                </div>
              )}
              <div>
                <h3 className="service-card__title">{service.title}</h3>
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
