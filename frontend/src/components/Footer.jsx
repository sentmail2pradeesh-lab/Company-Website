import { motion } from 'framer-motion';
import { useUI } from '../context/UIContext';
import Button from './Button';
import './components.css';

export default function Footer() {
  const { openContact } = useUI();

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
            Photo editing, video editing, software development, and digital marketing — delivered with precision and professionalism.
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
          <p className="footer__text">Mon – Fri, 9 AM – 6 PM IST</p>
        </div>

        <div>
          <h3 className="footer__heading">Contact</h3>
          <p className="footer__text">Have a project in mind? Reach out and our team will respond within 24 hours.</p>
          <Button onClick={() => openContact()}>Get In Touch</Button>
        </div>
      </div>

      <p className="footer__copyright">© 2025 ASZEN Technologies Pvt. Ltd. All rights reserved.</p>
    </motion.footer>
  );
}
