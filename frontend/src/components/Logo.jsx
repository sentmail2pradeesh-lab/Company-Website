import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Logo({ className = '' }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    if (pathname === '/') {
      // Already on the homepage — reload so the page returns to its initial state.
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  return (
    <Link to="/" onClick={handleClick} className={`inline-flex items-center gap-2.5 select-none ${className}`} aria-label="Vista Editz home">
      {/* Brand Mark */}
      <img
        src="/vistaeditz_logo.svg"
        alt="Vista Editz Logo"
        className="h-9 w-auto max-w-[140px] object-contain shrink-0 rounded-lg shadow-sm"
      />
    </Link>
  );
}
