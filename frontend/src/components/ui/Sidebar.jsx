import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { clearTokens, setTokens, apiClient } from '@shared/api-client/client';
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
  ShieldCheck, 
  Briefcase, 
  Store, 
  Building,
  CheckCircle2,
  X,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, setUser, logout, theme, toggleTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [switching, setSwitching] = useState(false);

  const demoAccounts = [
    {
      id: 'usr_admin',
      name: 'Admin Lead',
      email: 'admin@brightloop.com',
      password: 'Brightloop@2026',
      role: 'admin',
      company_name: 'Brightloop HQ',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'Full System Admin',
      description: 'Controls products, plans, taxes, discounts, and staff.',
      targetPath: '/dashboard',
    },
    {
      id: 'usr_staff',
      name: 'Sara Sales Rep',
      email: 'staff@brightloop.com',
      password: 'Staff@2026',
      role: 'staff',
      company_name: 'Brightloop Sales',
      icon: Briefcase,
      color: 'blue',
      badge: 'Sales Operations',
      description: 'Creates quotation templates, quotes, and converts them.',
      targetPath: '/quotations',
    },
    {
      id: 'usr_cust_shop',
      name: 'Corner Bakery',
      email: 'shop@customer.com',
      password: 'Customer@2026',
      role: 'customer',
      company_name: 'Corner Bakery Ltd',
      icon: Store,
      color: 'emerald',
      badge: 'Customer Portal (Small)',
      description: 'Views own subscriptions, overdue invoices, and payments.',
      targetPath: '/subscriptions',
    },
    {
      id: 'usr_cust_acme',
      name: 'Acme Global Tech',
      email: 'enterprise@acme.com',
      password: 'Acme@2026',
      role: 'customer',
      company_name: 'Acme Global Corporation',
      icon: Building,
      color: 'emerald',
      badge: 'Customer Portal (Enterprise)',
      description: 'Enterprise yearly contract, invoices, and payment receipts.',
      targetPath: '/invoices',
    },
  ];

  const handleSelectAccount = async (account) => {
    try {
      setSwitching(true);
      // Obtain real JWT from backend
      const res = await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: account.email, password: account.password }),
      });

      if (res && res.data && res.data.accessToken) {
        setTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
      } else {
        // Fallback for offline mock
        setUser({
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
          company_name: account.company_name,
        });
      }

      setShowSwitchModal(false);
      if (setMobileOpen) setMobileOpen(false);
      navigate(account.targetPath);
    } catch (err) {
      console.warn('Login during persona switch:', err);
      // Fallback
      setUser({
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        company_name: account.company_name,
      });
      setShowSwitchModal(false);
      if (setMobileOpen) setMobileOpen(false);
      navigate(account.targetPath);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Finance & Overview', icon: LayoutDashboard, desc: 'MRR & cashflow' },
    { to: '/spendx', label: 'SpendX Expenses', icon: Receipt, desc: 'AI OCR & Approvals' },
    { to: '/subscriptions', label: 'Subscriptions', icon: Repeat, desc: 'Lifecycle & status' },
    { to: '/invoices', label: 'Invoices & Billing', icon: Receipt, desc: 'Invoices & payments' },
    { to: '/catalog', label: 'Products & Plans', icon: Package, desc: 'Variants & discounts' },
    { to: '/quotations', label: 'Quotations', icon: FileText, desc: 'Templates & pipeline' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* 1. Brand Logo Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link to="/" onClick={() => setMobileOpen && setMobileOpen(false)} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
              B
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Brightloop
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                  Odoo
                </span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Subscription & Recurring Billing
              </div>
            </div>
          </Link>

          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Active Account Card & Switch Button (Clean, Non-Overlapping!) */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 px-1">
            <span>Current Session</span>
            <button
              onClick={() => setShowSwitchModal(true)}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 normal-case tracking-normal text-[11px]"
            >
              <RefreshCw className="w-3 h-3" /> Switch
            </button>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
              user?.role === 'admin' ? 'bg-purple-600' : user?.role === 'staff' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {user ? user.name[0] : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user ? user.name : 'Admin Lead'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                {user?.role === 'customer' 
                  ? `Customer • ${user.company_name || 'Portal'}` 
                  : user?.role === 'staff'
                  ? 'Sales Staff (Brightloop)'
                  : 'System Administrator (HQ)'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main Navigation Links (Clean, Spacious!) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2">
            Navigation
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 truncate">
                  <div className="leading-tight">{link.label}</div>
                  <div className={`text-[10px] font-normal truncate ${
                    isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {link.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 4. Bottom Controls: Theme Toggle & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
          
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all text-xs font-semibold shadow-xs"
          >
            <div className="flex items-center gap-2">
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-mono">
              Toggle
            </span>
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          )}

          <div className="text-center text-[10px] text-slate-400">
            Brightloop Subscription Platform
          </div>
        </div>

      </aside>

      {/* ======================================================== */}
      {/* 5. Clean Modal Dialog for Account Switching (NO OVERLAP!) */}
      {/* ======================================================== */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Switch Account Persona
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any account to open their live dashboard & portal:
                </p>
              </div>
              <button 
                onClick={() => setShowSwitchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isCurrent = user?.email === acc.email;
                return (
                  <button
                    key={acc.id}
                    disabled={switching}
                    onClick={() => handleSelectAccount(acc)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shadow-xs'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        acc.color === 'purple'
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          : acc.color === 'blue'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2">
                          <span>{acc.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {acc.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {acc.description}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
              <Link
                to="/register"
                onClick={() => setShowSwitchModal(false)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                + Register New Customer
              </Link>
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
