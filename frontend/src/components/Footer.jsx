import { motion } from 'framer-motion';
import Button from './Button';
import './components.css';

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="footer__grid">
        <div>
          <h3 className="footer__heading">Services</h3>
          <p className="footer__text">
            Professional photo editing, video editing, and software solutions tailored for your business.
          </p>
          <div className="footer__socials">
            {['f', 'in', 'ig', 'wa'].map((icon) => (
              <a key={icon} href="#" className="footer__social" aria-label={icon}>
                {icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="footer__heading">Support</h3>
          <p className="footer__text">aszentech@gmail.com</p>
        </div>

        <div>
          <h3 className="footer__heading">Contact</h3>
          <input
            type="email"
            className="footer__input"
            placeholder="Your Email Address"
          />
          <Button>Submit Your Inquiry</Button>
        </div>
      </div>

      <p className="footer__copyright">© 2025. All rights reserved.</p>
    </motion.footer>
  );
}
