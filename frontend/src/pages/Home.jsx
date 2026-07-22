// import { motion } from 'framer-motion';
// import Navbar from '../components/Navbar';
// import Hero from '../components/Hero';
// import Footer from '../components/Footer';

// const serviceCards = [
//   {
//     image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8e6?w=600&q=80',
//     caption: 'Professional photo editing to enhance your images.',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
//     caption: 'Innovative software solutions tailored for your needs.',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
//     caption: 'Reliable engineering services for your projects success.',
//   },
// ];

// export default function Home() {
//   return (
//     <div className="page">
//       <Navbar transparent />
//       <Hero />

//       <section id="services" className="home-cards">
//         {serviceCards.map((card, i) => (
//           <motion.div
//             key={card.caption}
//             className="home-card"
//             initial={{ opacity: 0, y: 50 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6, delay: i * 0.15 }}
//           >
//             <div className="home-card__image">
//               <img src={card.image} alt={card.caption} />
//             </div>
//             <p className="home-card__caption">{card.caption}</p>
//           </motion.div>
//         ))}
//       </section>

//       <Footer />
//     </div>
//   );
// }
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const serviceCards = [
  {
    image: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=600&q=80',
    caption: 'Professional photo editing to enhance your images.',
  },
  {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    caption: 'Innovative software solutions tailored for your needs.',
  },
  {
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    caption: 'Reliable engineering services for your projects success.',
  },
];

export default function Home() {
  return (
    <div className="page">
      <Navbar transparent />

      {/* Shared wrapper holding both Hero content & Service Cards */}
      <div className="hero-section-wrapper">
        <Hero />

        <section id="services" className="home-cards">
          {serviceCards.map((card, i) => (
            <motion.div
              key={card.caption}
              className="home-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="home-card__image">
                <img src={card.image} alt={card.caption} />
              </div>
              <p className="home-card__caption">{card.caption}</p>
            </motion.div>
          ))}
        </section>
      </div>

      {/* About Us section starts after the video background ends */}
      <section id="about" className="about-section">
        <div className="about-container">
          <motion.div 
            className="about-content"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="about-title">About us</h2>
            <p className="about-text">
              We are a team of skilled professionals providing expert AutoCAD engineering
              services for various industries, including architecture, mechanical design,
              electrical systems, and construction.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}