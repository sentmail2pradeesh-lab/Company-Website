import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../context/UIContext';
import Input from './Input';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { COMPANY } from '../lib/data';

const serviceOptions = [
  'Photo Editing',
  'Video Editing',
  'Digital Marketing',
  'Software Development',
  'Other',
];

export default function ContactPopup() {
  const { isContactOpen, contactService, closeContact } = useUI();
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contactService) setForm((prev) => ({ ...prev, service: contactService }));
  }, [contactService]);

  useEffect(() => {
    document.body.style.overflow = isContactOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isContactOpen]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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

  const inputCls = 'w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-mist/60 outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition-all hover:border-slate/30';

  return (
    <AnimatePresence>
      {isContactOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.aside
            className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-float flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-line">
              <div>
                <h2 className="text-xl font-bold font-display text-ink">Let's talk</h2>
                <p className="text-sm text-mist mt-1">Share your project — we'll reply within 24 hours.</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-cloud transition-colors text-mist"
                aria-label="Close"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {submitted ? (
                <motion.div
                  className="flex h-full flex-col items-center justify-center text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-soft text-emerald mb-5">
                    <Icon name="shield" className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-ink mb-2">Thank you!</h3>
                  <p className="text-sm text-mist max-w-xs mb-6">
                    Your inquiry has been received. Our team will contact you within 24 hours.
                  </p>
                  <Button onClick={handleClose}>Close</Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                  <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" required />
                  <Input label="Phone Number" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="service" className="text-sm font-medium text-ink">Service Interested In</label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className={inputCls}
                      required
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-sm font-medium text-ink">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project…"
                      rows={4}
                      className={`${inputCls} resize-none`}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Sending…' : 'Submit Inquiry'}
                  </Button>

                  <p className="text-xs text-mist text-center pt-2">
                    Or email us at <a href={`mailto:${COMPANY.email}`} className="text-royal font-medium">{COMPANY.email}</a>
                  </p>
                </form>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
