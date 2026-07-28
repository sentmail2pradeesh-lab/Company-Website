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
        className="w-9 h-9 shrink-0"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="veTile" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E3A8A" />
            <stop offset="1" stopColor="#2547A8" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#veTile)" />
        <path d="M16 20 L31 46 L46 20" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="48" cy="18" r="5" fill="#10B981" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-800 tracking-tight text-ink">
          Vista<span className="text-gradient-brand"> Editz</span>
        </span>
        <span className="text-[0.6rem] font-medium tracking-[0.18em] uppercase text-mist mt-0.5">
          Creative Digital Solutions
        </span>
      </div>
    </Link>
  );
}
