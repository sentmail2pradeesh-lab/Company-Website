import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { COMPANY, SERVICES } from '../lib/data';

export default function Footer() {

  return (
    <footer className="bg-cloud border-t border-line">
      {/* Top CTA band */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 py-16 px-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold font-display text-ink tracking-tight">
              Ready to elevate your visuals?
            </h3>
            <p className="mt-2 text-mist">
              Tell us about your project and get a free quote within 24 hours.
            </p>
          </div>
          <Button size="lg" to="/contact">
            Start Your Project
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm text-mist leading-relaxed max-w-xs">
              Premium creative digital solutions for real estate, e-commerce, agencies and enterprises worldwide.
            </p>
            <div className="mt-5 flex gap-2">
              {COMPANY.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-mist hover:text-royal hover:bg-royal-50 border border-line transition-colors"
                >
                  <Icon name={s.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">Services</h4>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={s.route}
                    className="text-sm text-mist hover:text-royal transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About', href: '/#why' },
                { label: 'Portfolio', href: '/#portfolio' },
                { label: 'Blogs', href: '/blogs' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-sm text-mist hover:text-royal transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">Stay updated</h4>
            <p className="text-sm text-mist mb-3">Design tips, case studies and company news — once a month.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.target.reset();
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="flex-1 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-mist/50 outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 transition-all"
              />
              <Button size="sm" type="submit" className="shrink-0">
                <Icon name="arrowRight" className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-mist sm:flex-row">
          <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Icon name="heart" className="w-3 h-3 text-emerald" /> in Chennai
          </p>
        </div>
      </div>
    </footer>
  );
}
