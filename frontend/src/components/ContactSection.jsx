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
    <section id="contact" className="py-24 lg:py-36 bg-gradient-to-b from-slate-100/70 via-indigo-50/40 to-slate-100 dark:from-obsidian dark:via-obsidian dark:to-obsidian relative overflow-hidden transition-colors">
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
          className="mt-16 grid gap-8 lg:grid-cols-5"
        >
          {/* Left info */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="rounded-[2.5rem] border border-line bg-obsidian-card p-8 shadow-float glass-card backdrop-blur-2xl h-full flex flex-col justify-between">
              <div className="space-y-6">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      <Icon name={item.icon} className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-mist">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-base font-bold text-ink hover:text-cyan-400 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-base font-bold text-ink">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-6 border-t border-line">
                <p className="text-xs font-bold uppercase tracking-wider text-mist mb-4">Follow us</p>
                <div className="flex gap-2.5">
                  {COMPANY.socials.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      aria-label={s.name}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-mist hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 border border-line transition-all"
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
            <div className="rounded-[2.5rem] border border-line bg-obsidian-card p-8 md:p-10 shadow-float glass-card backdrop-blur-2xl">
              {submitted ? (
                <motion.div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-6 shadow-emerald">
                    <Icon name="shield" className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-ink">Thank you!</h3>
                  <p className="mt-3 text-mist max-w-sm font-normal">We've received your inquiry. Our team will get back to you within 24 hours.</p>
                  <Button variant="outline" className="mt-8" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', service: '', message: '' }); }}>
                    Send another
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input label="Full Name" name="name" value={form.name} onChange={ch} placeholder="John Doe" required />
                    <Input label="Email" type="email" name="email" value={form.email} onChange={ch} placeholder="you@company.com" required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="svc" className="text-xs font-bold text-mist uppercase tracking-wider">Service Interested In</label>
                    <select
                      id="svc"
                      name="service"
                      value={form.service}
                      onChange={ch}
                      required
                      className="w-full rounded-2xl border border-line bg-obsidian-card px-4 py-3.5 text-sm text-ink outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all cursor-pointer"
                    >
                      <option value="" className="bg-obsidian-card text-mist">Select a service</option>
                      {serviceOptions.map((o) => <option key={o} value={o} className="bg-obsidian-card text-ink">{o}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="msg" className="text-xs font-bold text-mist uppercase tracking-wider">Message</label>
                    <textarea
                      id="msg" name="message" value={form.message} onChange={ch}
                      placeholder="Tell us about your project…"
                      rows={5}
                      required
                      className="w-full rounded-2xl border border-line bg-obsidian-card px-4 py-3.5 text-sm text-ink placeholder:text-mist outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} variant="primary" iconRight="arrowRight" className="w-full">
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
