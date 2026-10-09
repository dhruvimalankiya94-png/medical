import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Activity, LayoutDashboard, LineChart, FileText, 
  PlusCircle, AlertTriangle, Sparkles, CalendarCheck, 
  TrendingUp, Award, Flame, User, Settings as SettingsIcon, 
  LogOut, X, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { avatarUrl } from '../../utils/avatar';

const mainNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Health Analytics', path: '/analytics', icon: LineChart },
  { name: 'Health Records', path: '/records', icon: FileText },
  { name: 'Add Health Record', path: '/records/add', icon: PlusCircle },
  { name: 'Risk Assessment', path: '/risk-assessment', icon: AlertTriangle },
  { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
  { name: 'Daily Planner', path: '/planner', icon: CalendarCheck },
];

const secondaryNavItems = [
  { name: 'Progress Tracking', path: '/progress', icon: TrendingUp },
  { name: 'Health Reports', path: '/reports', icon: FileText },
  { name: 'Achievements', path: '/achievements', icon: Award },
  { name: 'Streaks', path: '/streak', icon: Flame },
  { name: 'My Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/90 dark:bg-[#0b1329]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="overflow-y-auto flex-1">
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 bg-white/90 dark:bg-[#0b1329]/95 z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-teal-500 to-cyan-400 p-0.5 shadow-glow-emerald">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Health<span className="text-brand-500">Pulse</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                  Health Analytics
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6">
            
            {/* Core Modules */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Core Modules
              </div>

              {mainNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </NavLink>
                );
              })}
            </div>

            {/* Performance & Analytics */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Insights & Profile
              </div>

              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </NavLink>
                );
              })}
            </div>

          </nav>
        </div>

        {/* Footer Profile Banner */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-[#0b1329]/95">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link to="/profile" className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={avatarUrl(user)}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-brand-500 shrink-0"
              />
              <div className="truncate">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</h5>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@email.com'}</p>
              </div>
            </Link>
            <button type="button" onClick={handleLogout} title="Sign Out" aria-label="Sign Out">
              <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400 transition-colors" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
