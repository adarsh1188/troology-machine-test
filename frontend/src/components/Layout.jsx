import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { getSocket } from '../api/socket';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/users', label: 'Users', adminOnly: true },
  { to: '/activity', label: 'Activity', adminOnly: true },
  { to: '/profile', label: 'Profile' },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const themeMode = useSelector((s) => s.theme.mode);
  const isAdmin = user?.role === 'admin';

  // Real-time activity notifications (Socket.io)
  useEffect(() => {
    const socket = getSocket();
    const handler = (activity) => {
      toast.info(`🔔 ${activity.message}`);
    };
    socket.on('activity', handler);
    return () => socket.off('activity', handler);
  }, []);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white'
        : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-600">📋 PMS</span>
            <span className="hidden text-sm text-gray-500 sm:inline">
              Project Management System
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="btn-secondary !px-3"
              title="Toggle theme"
            >
              {themeMode === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button onClick={onLogout} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-48 shrink-0 sm:block">
          <nav className="space-y-1">
            {navItems
              .filter((i) => !i.adminOnly || isAdmin)
              .map((i) => (
                <NavLink key={i.to} to={i.to} className={linkClass}>
                  {i.label}
                </NavLink>
              ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
