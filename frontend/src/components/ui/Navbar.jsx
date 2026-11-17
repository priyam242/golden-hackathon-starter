import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { clearTokens } from '@shared/api-client/client';
import { 
  LayoutDashboard, 
  Repeat, 
  Receipt, 
  Package, 
  FileText, 
  LogOut, 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  Briefcase, 
  Store, 
  Building,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export function Navbar() {
  const { user, setUser, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const demoAccounts = [
    {
      id: 'usr_admin',
      name: 'Admin Lead',
      email: 'admin@brightloop.com',
      role: 'admin',
      company_name: 'Brightloop HQ',
      icon: ShieldCheck,
      badge: 'Full Access (Admin)',
      targetPath: '/dashboard',
    },
    {
      id: 'usr_staff',
      name: 'Sara Sales Rep',
      email: 'staff@brightloop.com',
      role: 'staff',
      company_name: 'Brightloop Sales',
      icon: Briefcase,
      badge: 'Sales & Invoicing',
      targetPath: '/quotations',
    },
    {
      id: 'usr_cust_shop',
      name: 'Corner Bakery',
      email: 'shop@customer.com',
      role: 'customer',
      company_name: 'Corner Bakery Ltd',
      icon: Store,
      badge: 'Customer Portal (Small Shop)',
      targetPath: '/subscriptions',
    },
    {
      id: 'usr_cust_acme',
      name: 'Acme Global Tech',
      email: 'enterprise@acme.com',
      role: 'customer',
      company_name: 'Acme Global Corporation',
      icon: Building,
      badge: 'Customer Portal (Enterprise)',
      targetPath: '/invoices',
    },
  ];

  const handleSelectAccount = (account) => {
    setUser({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      company_name: account.company_name,
    });
    setAccountMenuOpen(false);
    navigate(account.targetPath);
  };

  const handleLogout = () => {
    clearTokens();
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Finance & Overview', icon: LayoutDashboard },
    { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
    { to: '/invoices', label: 'Invoices & Billing', icon: Receipt },
    { to: '/catalog', label: 'Products & Plans', icon: Package },
    { to: '/quotations', label: 'Quotations', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              B
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Brightloop
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                  Odoo System
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Subscription & Recurring Billing
              </div>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Controls & Account Switcher */}
          <div className="flex items-center gap-2.5">
            
            {/* 1. Light / Dark Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1 text-xs font-medium"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-[11px] font-semibold">Light</span>
                </>
              )}
            </button>

            {/* 2. Account Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-all shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                  {user ? user.name[0] : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-tight flex items-center gap-1">
                    {user ? user.name : 'Switch Account'}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                    {user ? `${user.role} (${user.company_name || 'Portal'})` : 'Select persona'}
                  </div>
                </div>
              </button>

              {/* Account Switcher Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Open & Switch Any Account
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Select persona to view their dedicated interface:
                    </div>
                  </div>

                  <div className="space-y-1">
                    {demoAccounts.map((acc) => {
                      const Icon = acc.icon;
                      const isCurrent = user?.email === acc.email;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => handleSelectAccount(acc)}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className={`p-1.5 rounded-md ${
                            acc.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                              : acc.role === 'staff'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold flex items-center justify-between">
                              <span>{acc.name}</span>
                              {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{acc.badge}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{acc.email}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center px-1">
                    <Link
                      to="/register"
                      onClick={() => setAccountMenuOpen(false)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      + Create New Account
                    </Link>
                    {user && (
                      <button
                        onClick={handleLogout}
                        className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <LogOut className="w-3 h-3" /> Logout
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
