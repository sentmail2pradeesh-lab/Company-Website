import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { NAV_LINKS, SERVICES } from '../lib/data';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { openLogin, user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [solid, setSolid] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [mobile, setMobile] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
    setDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobile]);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const linkCls = (href) => [
    'relative text-sm font-medium transition-colors duration-200',
    isActive(href) ? 'text-royal' : 'text-slate hover:text-ink',
  ].join(' ');

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid
          ? 'bg-white/75 backdrop-blur-xl border-b border-line shadow-[0_1px_12px_rgba(30,58,138,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16 lg:h-[72px]" aria-label="Main navigation">
        <Logo className="relative z-50" />

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.label} className="relative" ref={l.dropdown === 'services' ? dropRef : undefined}>
              {l.dropdown ? (
                <button
                  onClick={() => setDropdown((v) => !v)}
                  onBlur={() => setTimeout(() => setDropdown(false), 150)}
                  className={`${linkCls(l.href)} flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer`}
                  aria-expanded={dropdown}
                  aria-haspopup="true"
                >
                  {l.label}
                  <Icon name="chevronDown" className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdown ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link to={l.href} className={`${linkCls(l.href)} px-3 py-2 rounded-lg`}>
                  {l.label}
                </Link>
              )}

              {l.dropdown === 'services' && (
                <AnimatePresence>
                  {dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] rounded-2xl border border-line bg-white p-2 shadow-float z-50"
                    >
                      <div className="grid grid-cols-2 gap-1">
                        {SERVICES.map((s) => (
                          <Link
                            key={s.slug}
                            to={s.route}
                            className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-cloud"
                          >
                            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              s.color === 'emerald'
                                ? 'bg-emerald-soft text-emerald'
                                : s.color === 'sky'
                                ? 'bg-sky-soft text-sky'
                                : 'bg-royal-50 text-royal'
                            }`}>
                              <Icon name={s.icon} className="w-4 h-4" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-ink group-hover:text-royal transition-colors">
                                {s.name}
                              </p>
                              <p className="mt-0.5 text-xs text-mist leading-relaxed line-clamp-2">
                                {s.tagline}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={openLogin}>Login</Button>
          )}
          <Button size="sm" onClick={() => navigate('/contact')}>
            Get Started
          </Button>
        </div>

        <button
          className="relative z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-xl hover:bg-cloud transition-colors"
          onClick={() => setMobile((v) => !v)}
          aria-label={mobile ? 'Close menu' : 'Open menu'}
        >
          <Icon name={mobile ? 'close' : 'menu'} className="w-6 h-6 text-ink" />
        </button>
      </nav>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white lg:hidden"
          >
            <div className="flex flex-col pt-24 px-6 gap-1 overflow-y-auto h-full pb-12">
              {NAV_LINKS.map((l, i) => (
                l.dropdown ? (
                  <div key={l.label}>
                    <button
                      onClick={() => setDropdown((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left text-lg font-semibold text-ink rounded-xl hover:bg-cloud transition-colors"
                    >
                      {l.label}
                      <Icon name="chevronDown" className={`w-4 h-4 text-mist transition-transform ${dropdown ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {dropdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {SERVICES.map((s) => (
                            <Link
                              key={s.slug}
                              to={s.route}
                              className="flex items-center gap-3 px-8 py-2.5 text-sm text-slate hover:text-royal rounded-lg hover:bg-cloud transition-colors"
                            >
                              <Icon name={s.icon} className="w-4 h-4" />
                              {s.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    key={l.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      to={l.href}
                      className={`block px-4 py-3.5 text-lg font-semibold rounded-xl hover:bg-cloud transition-colors ${
                        isActive(l.href) ? 'text-royal' : 'text-ink'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                )
              ))}

              <div className="mt-6 flex flex-col gap-3 px-4">
                {user ? (
                  <Button variant="outline" onClick={() => { logout(); setMobile(false); }}>Logout</Button>
                ) : (
                  <Button variant="outline" onClick={() => { openLogin(); setMobile(false); }}>Login</Button>
                )}
                <Button onClick={() => { setMobile(false); navigate('/contact'); }}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
