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
    <Link to="/" onClick={handleClick} className={`inline-flex items-center gap-2.5 select-none ${className}`} aria-label="Vista Edits home">
      {/* Mark */}
      <svg
        className="w-9 h-9 shrink-0 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="veTile" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#veTile)" />
        <path d="M16 20 L31 46 L46 20" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="48" cy="18" r="5" fill="#10B981" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold tracking-tight text-ink">
          Vista<span className="text-gradient-brand"> Editz</span>
        </span>
        <span className="text-[0.6rem] font-bold tracking-[0.18em] uppercase text-mist mt-1">
          Creative Digital Solutions
        </span>
      </div>
    </Link>
  );
}
