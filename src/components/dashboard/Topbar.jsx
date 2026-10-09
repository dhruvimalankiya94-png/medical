import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Sun, Moon, Bell, Search, 
  X, Loader2, FileText
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { recordsAPI, alertsAPI } from '../../services/api';
import { avatarUrl } from '../../utils/avatar';

const Topbar = ({ setMobileOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // The bell reflects the real threshold alerts produced by /api/alerts rather
  // than a fixed list, so the unread dot means something.
  useEffect(() => {
    let cancelled = false;
    alertsAPI
      .getAll()
      .then((res) => {
        if (!cancelled) setAlerts(res.alerts || []);
      })
      .catch(() => {
        if (!cancelled) setAlerts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const actionableCount = alerts.filter((a) => a.severity !== 'info').length;

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setShowSearch(true);
      try {
        const data = await recordsAPI.getAll({ search: value, limit: 8 });
        const records = data?.records || [];
        setSearchResults(records);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block" ref={searchRef}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, vitals, or notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearch(true)}
            className="w-full py-2 pl-9 pr-4 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
          {showSearch && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 max-h-80 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                  <span className="text-xs text-slate-400">Searching...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No records found</p>
              ) : (
                <>
                  {searchResults.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => { setShowSearch(false); setSearchQuery(''); navigate('/records'); }}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                    >
                      <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {r.recordType || 'Health Record'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {r.vitals?.bpSystolic ? `BP: ${r.vitals.bpSystolic}/${r.vitals.bpDiastolic}` : ''}
                          {r.vitals?.sugarFasting ? ` | Sugar: ${r.vitals.sugarFasting}` : ''}
                          {r.sleepHours ? ` | Sleep: ${r.sleepHours}h` : ''}
                          {` — ${new Date(r.recordDate || r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
                        </p>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowSearch(false); navigate('/records'); }}
                    className="w-full text-center py-2 text-[10px] font-bold text-brand-500 hover:text-brand-600 border-t border-slate-200 dark:border-slate-800 mt-1"
                  >
                    View all records
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Online</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-brand-400 border border-slate-200 dark:border-slate-800 relative"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  actionableCount > 0 ? 'bg-rose-500' : 'bg-brand-500'
                }`}
              />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Notifications</h4>
                <button onClick={() => setShowNotifications(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                    No health alerts. All your latest readings are within range.
                  </p>
                ) : (
                  alerts.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.metric}
                        {n.value ? ` \u00b7 ${n.value}` : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-brand-400 border border-slate-200 dark:border-slate-800"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={avatarUrl(user)}
            alt={user?.name || 'User Avatar'}
            className="w-8 h-8 rounded-full object-cover border border-brand-500"
          />
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
