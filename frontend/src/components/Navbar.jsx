import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import './components.css';

const navLinks = [
  { path: '/photo-editing', label: 'Photo editing' },
  { path: '/video-editing', label: 'Video editing' },
  { path: '/blogs', label: 'Blogs' },
];

export default function Navbar({ transparent = false }) {
  const { pathname } = useLocation();
  const { user, openLogin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
