import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../context/theme';

const Navbar = ({ title = 'Memory Vault', showSearch = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigate(query ? `/memories?search=${encodeURIComponent(query)}` : '/memories');
    setSearchOpen(false);
  };

  return (
    <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-violet-500">Memory Vault</p>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && searchOpen && (
          <form onSubmit={handleSearch} className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              autoFocus
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-32 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-48"
              placeholder="Search memories..."
              aria-label="Search memories"
            />
          </form>
        )}

        {showSearch && (
          <button
            type="button"
            onClick={() => setSearchOpen((current) => !current)}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm transition hover:bg-slate-50"
            aria-label={searchOpen ? 'Close search' : 'Search memories'}
            aria-expanded={searchOpen}
          >
            🔎
          </button>
        )}

        <button
          type="button"
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
        >
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>

        <Link to="/profile" className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'M'}
          </span>
          <span className="text-sm font-medium text-slate-700">{user?.fullName || 'User'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
