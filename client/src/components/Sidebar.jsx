import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Memories', path: '/memories', icon: '📸' },
  { label: 'Timeline', path: '/timeline', icon: '📅' },
  { label: 'Favorites', path: '/favorites', icon: '❤️' },
  { label: 'Profile', path: '/profile', icon: '👤' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex w-full flex-col justify-between rounded-[28px] border border-slate-200 bg-[#F7F4FF] p-5 shadow-sm md:w-72">
      <div>
        <Link to="/dashboard" className="mb-8 flex items-center gap-3 px-2 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white shadow-lg shadow-violet-200">
            🗄️
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-violet-500">Private</p>
            <h2 className="text-lg font-semibold text-slate-800">Memory Vault</h2>
          </div>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-link flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                    : 'text-slate-600 hover:bg-violet-100/60 hover:text-slate-800'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="sidebar-logout-button mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <span>🚪</span>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
