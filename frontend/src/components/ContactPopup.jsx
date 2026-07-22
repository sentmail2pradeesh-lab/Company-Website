import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../context/UIContext';
import Input from './Input';
import Button from './Button';

const serviceOptions = [
  'Photo Editing',
  'Video Editing',
  'Digital Marketing',
  'Software Development',
  'Other',
];

export default function ContactPopup() {
  const { isContactOpen, contactService, closeContact } = useUI();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: contactService || '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contactService) {
      setForm((prev) => ({ ...prev, service: contactService }));
    }
  }, [contactService]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClose = () => {
    closeContact();
    setSubmitted(false);
    setForm({ name: '', email: '', phone: '', service: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  const currentService = contactService || form.service;

  return (
    <AnimatePresence>
      {isContactOpen && (
        <>
          <motion.div
            className="contact-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.aside
            className="contact-popup"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            <div className="contact-popup__header">
              <div>
                <h2 className="contact-popup__title">Contact Us</h2>
                <p className="contact-popup__subtitle">
                  Share your project details and we&apos;ll get back to you shortly.
                </p>
              </div>
              <button type="button" className="contact-popup__close" onClick={handleClose}>
                ×
              </button>
            </div>

            {submitted ? (
              <motion.div
                className="contact-popup__success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="contact-popup__success-icon">✓</div>
                <h3>Thank you!</h3>
                <p>Your inquiry has been received. Our team will contact you within 24 hours.</p>
                <Button onClick={handleClose}>Close</Button>
              </motion.div>
            ) : (
              <form className="contact-popup__form" onSubmit={handleSubmit}>
                <Input
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
                <div className="input-group">
                  <label htmlFor="service" className="input-group__label">
                    Service Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={currentService}
                    onChange={handleChange}
                    className="input-group__field contact-popup__select"
                    required
                  >
                    <option value="">Select a service</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="message" className="input-group__label">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project..."
                    className="input-group__field contact-popup__textarea"
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Submit Inquiry'}
                </Button>
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
