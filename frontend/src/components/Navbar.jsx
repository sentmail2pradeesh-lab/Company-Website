import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import Button from './Button';
import './components.css';

const navLinks = [
  { path: '/photo-editing', label: 'Photo editing' },
  { path: '/video-editing', label: 'Video editing' },
  { path: '/blogs', label: 'Blogs' },
];

const serviceDropdown = [
  { path: '/digital-marketing', label: 'Digital marketing' },
  { path: '/software-development', label: 'Software development' },
];

export default function Navbar({ transparent = false }) {
  const { pathname } = useLocation();
  const { user, openLogin, logout } = useAuth();
  const { openContact } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isServiceActive = serviceDropdown.some((s) => s.path === pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSolid = !transparent || scrolled;

  return (
    <motion.nav
      className={`navbar ${isSolid ? 'navbar--solid' : 'navbar--transparent'}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Link to="/" className="navbar__logo">
        <span className="navbar__logo-main">
          <span>A</span>SZEN
        </span>
        <span className="navbar__logo-sub">TECHNOLOGIES PVT. LTD.</span>
      </Link>

      <button
        type="button"
        className="navbar__menu-btn"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
        {navLinks.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`navbar__link ${pathname === link.path ? 'navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          </li>
        ))}

        <li
          className="navbar__dropdown"
          ref={dropdownRef}
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button
            type="button"
            className={`navbar__link navbar__dropdown-trigger ${isServiceActive ? 'navbar__link--active' : ''}`}
            onClick={() => setDropdownOpen((o) => !o)}
            aria-expanded={dropdownOpen}
          >
            Services
            <svg className="navbar__chevron" viewBox="0 0 12 12" width="10" height="10">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.ul
                className="navbar__dropdown-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {serviceDropdown.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`navbar__dropdown-item ${pathname === item.path ? 'navbar__dropdown-item--active' : ''}`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>

        <li>
          <button
            type="button"
            className="navbar__link navbar__contact-btn"
            onClick={() => openContact()}
          >
            Contact
          </button>
        </li>
      </ul>

      <div className="navbar__actions">
        {user ? (
          <>
            <span className="navbar__user">{user.email}</span>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <Button onClick={openLogin}>Login</Button>
        )}
      </div>
    </motion.nav>
  );
}
