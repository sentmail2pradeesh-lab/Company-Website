import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { COMPANY, SERVICES } from '../lib/data';

export default function Footer() {
  return (
    <footer className="dark bg-slate-950 border-t border-slate-800 text-slate-300">
      {/* Grid */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="mb-5" />
            <p className="text-[15px] font-normal text-slate-400 leading-relaxed max-w-xs">
              Premium creative digital solutions for real estate, e-commerce, agencies and enterprises worldwide.
            </p>
            <div className="mt-6 flex gap-2.5">
              {COMPANY.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={`${s.name}: ${s.handle}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/30 border border-slate-800 transition-all"
                >
                  <Icon name={s.icon} className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base font-extrabold text-white mb-5 font-display tracking-tight">Services</h4>
            <ul className="space-y-3.5">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={s.route}
                    className="text-[15px] font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-base font-extrabold text-white mb-5 font-display tracking-tight">Company</h4>
            <ul className="space-y-3.5">
              {[
                { label: 'About', href: '/#why' },
                { label: 'Blogs', href: '/blogs' },
                { label: 'Contact', href: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-[15px] font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-base font-extrabold text-white mb-5 font-display tracking-tight">Stay updated</h4>
            <p className="text-[15px] font-normal text-slate-400 mb-4 leading-relaxed">
              Design tips, case studies and company news — once a month.
            </p>
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
                className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              />
              <Button size="sm" variant="primary" type="submit" className="shrink-0">
                <Icon name="arrowRight" className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm font-bold text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}
