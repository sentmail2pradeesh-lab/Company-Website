import { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import Input from './Input';
import Button from './ui/Button';
import { COMPANY } from '../lib/data';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

const serviceOptions = ['Photo Editing', 'Video Editing', 'Digital Marketing', 'Software Development', 'Other'];

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  const ch = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const infoItems = [
    { icon: 'envelope', label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { icon: 'phoneIcon', label: 'Phone', value: COMPANY.phone, href: `tel:${COMPANY.phone}` },
    { icon: 'map', label: 'Location', value: COMPANY.location },
  ];

  return (
    <section id="contact" className="py-20 lg:py-32 bg-cream">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Contact"
          badgeAccent="emerald"
          title="Let's build something great."
          titleHighlight="something great."
          subtitle="Tell us about your project and we'll respond within 24 hours with a tailored proposal."
        />

        <motion.div
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-8 lg:grid-cols-5"
        >
          {/* Left info */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="rounded-3xl border border-line bg-white p-7 shadow-card h-full flex flex-col justify-between">
              <div className="space-y-5">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-royal-50 text-royal">
                      <Icon name={item.icon} className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-mist">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium text-ink hover:text-royal transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-sm font-medium text-ink">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-line">
                <p className="text-xs font-semibold uppercase tracking-wider text-mist mb-3">Follow us</p>
                <div className="flex gap-2">
                  {COMPANY.socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      aria-label={s.name}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-mist hover:bg-royal-50 hover:text-royal transition-colors"
                    >
                      <Icon name={s.icon} className="w-4.5 h-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <div className="rounded-3xl border border-line bg-white p-7 md:p-9 shadow-card">
              {submitted ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-soft text-emerald mb-5">
                    <Icon name="shield" className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-ink">Thank you!</h3>
                  <p className="mt-2 text-mist max-w-sm">We've received your inquiry. Our team will get back to you within 24 hours.</p>
                  <Button variant="outline" className="mt-6" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', service: '', message: '' }); }}>
                    Send another
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Full Name" name="name" value={form.name} onChange={ch} placeholder="John Doe" required />
                    <Input label="Email" type="email" name="email" value={form.email} onChange={ch} placeholder="you@company.com" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="svc" className="text-sm font-medium text-ink">Service Interested In</label>
                    <select
                      id="svc"
                      name="service"
                      value={form.service}
                      onChange={ch}
                      required
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition-all"
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="msg" className="text-sm font-medium text-ink">Message</label>
                    <textarea
                      id="msg" name="message" value={form.message} onChange={ch}
                      placeholder="Tell us about your project…"
                      rows={5}
                      required
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-mist/60 outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition-all resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} iconRight="arrowRight" className="w-full">
                    {loading ? 'Sending…' : 'Send Inquiry'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
