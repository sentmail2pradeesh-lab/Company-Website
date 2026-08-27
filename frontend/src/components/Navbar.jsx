import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import Button from './ui/Button';
import Icon from './ui/Icon';
import { NAV_LINKS, SERVICES } from '../lib/data';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Navbar() {
  const { openLogin, user, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [solid, setSolid] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [mobile, setMobile] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
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
    'relative text-[14px] font-bold tracking-tight transition-colors duration-200',
    isActive(href) ? 'text-indigo-500 dark:text-cyan-400 font-extrabold' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white',
  ].join(' ');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-3.5 pointer-events-none">
      <nav
        className={`pointer-events-auto mx-auto max-w-6xl flex items-center justify-between px-5 h-14 lg:h-[60px] rounded-full transition-all duration-300 border ${
          solid
            ? 'glass-card shadow-float border-line'
            : 'bg-obsidian-card/85 backdrop-blur-xl border-line shadow-card'
        }`}
        aria-label="Main navigation"
      >
        <Logo className="relative z-50" />

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1.5">
          {NAV_LINKS.map((l) => (
            <li key={l.label} className="relative" ref={l.dropdown === 'services' ? dropRef : undefined}>
              {l.dropdown ? (
                <button
                  onClick={() => setDropdown((v) => !v)}
                  onBlur={() => setTimeout(() => setDropdown(false), 150)}
                  className={`${linkCls(l.href)} flex items-center gap-1 px-3.5 py-1.5 rounded-full cursor-pointer hover:bg-slate-500/10 transition-all`}
                  aria-expanded={dropdown}
                  aria-haspopup="true"
                >
                  {l.label}
                  <Icon name="chevronDown" className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdown ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} />
                </button>
              ) : (
                <Link to={l.href} className={`${linkCls(l.href)} px-3.5 py-1.5 rounded-full hover:bg-slate-500/10 transition-all`}>
                  {l.label}
                  {isActive(l.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(236,72,153,0.8)]"
                    />
                  )}
                </Link>
              )}

              {l.dropdown === 'services' && (
                <AnimatePresence>
                  {dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[540px] rounded-3xl border border-line bg-obsidian-card/95 backdrop-blur-2xl p-3 shadow-float z-50"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {SERVICES.map((s) => (
                          <Link
                            key={s.slug}
                            to={s.route}
                            className="group flex items-start gap-3.5 rounded-2xl p-3 transition-all hover:bg-slate-500/10 border border-transparent hover:border-line"
                          >
                            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-md shadow-card ${
                              s.color === 'emerald'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : s.color === 'sky'
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            }`}>
                              <Icon name={s.icon} className="w-4 h-4" />
                            </span>
                            <div>
                              <p className="text-sm font-bold text-ink group-hover:text-cyan-400 transition-colors">
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

        {/* Desktop Actions & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-2.5">
          <motion.button
            whileTap={{ rotate: 180, scale: 0.85 }}
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/10 hover:bg-slate-500/20 text-ink border border-line transition-all cursor-pointer"
            aria-label="Toggle Light/Dark Theme"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4 text-cyan-400" />
          </motion.button>

          {/* Dashboard link hidden for public release */}
          {/* <Link
            to="/dashboard"
            className="flex h-9 items-center gap-1.5 px-3.5 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <Icon name="grid" className="w-3.5 h-3.5" /> Dashboard
          </Link> */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-500/10 border border-line text-xs font-semibold text-ink">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
                <span>{user.name || user.email?.split('.')[0] || 'User'}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={openLogin}>Login</Button>
          )}
          <Button size="sm" variant="primary" onClick={() => navigate('/contact')}>
            Get Started
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/10 text-ink border border-line"
            aria-label="Toggle Light/Dark Theme"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            className="relative z-50 flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/10 border border-line transition-colors"
            onClick={() => setMobile((v) => !v)}
            aria-label={mobile ? 'Close menu' : 'Open menu'}
          >
            <Icon name={mobile ? 'close' : 'menu'} className="w-5 h-5 text-ink" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-40 bg-obsidian/95 backdrop-blur-2xl lg:hidden pointer-events-auto"
          >
            <div className="flex flex-col pt-24 px-6 gap-2 overflow-y-auto h-full pb-12">
              {NAV_LINKS.map((l, i) => (
                l.dropdown ? (
                  <div key={l.label}>
                    <button
                      onClick={() => setDropdown((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-base font-bold text-ink rounded-2xl bg-slate-500/10 border border-line transition-colors"
                    >
                      {l.label}
                      <Icon name="chevronDown" className={`w-4 h-4 text-cyan-400 transition-transform ${dropdown ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {dropdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2 space-y-1.5 pl-3"
                        >
                          {SERVICES.map((s) => (
                            <Link
                              key={s.slug}
                              to={s.route}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-500/5 border border-line transition-colors"
                            >
                              <Icon name={s.icon} className="w-4 h-4 text-cyan-400" />
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
                      className={`block px-4 py-3 text-base font-bold rounded-2xl transition-colors border ${
                        isActive(l.href)
                          ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                          : 'text-ink bg-slate-500/10 border-line hover:bg-slate-500/20'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                )
              ))}

              <div className="mt-6 flex flex-col gap-3 px-1">
                {user ? (
                  <Button variant="outline" onClick={() => { logout(); setMobile(false); }}>Logout</Button>
                ) : (
                  <Button variant="outline" onClick={() => { openLogin(); setMobile(false); }}>Login</Button>
                )}
                <Button variant="primary" onClick={() => { setMobile(false); navigate('/contact'); }}>
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
