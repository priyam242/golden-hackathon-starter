import React from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Menu, Sparkles, Shield, User, Briefcase, Store } from 'lucide-react';

export function TopHeader({ setMobileOpen }) {
  const location = useLocation();
  const { user } = useStore();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'System Overview & Welcome';
      case '/dashboard':
        return 'Finance Intelligence Dashboard';
      case '/subscriptions':
        return 'Subscriptions Management';
      case '/invoices':
        return 'Invoices & Recurring Billing';
      case '/catalog':
        return 'Products, Variants & Plans';
      case '/quotations':
        return 'Quotation Templates & Offers';
      case '/login':
        return 'Sign In';
      case '/register':
        return 'Customer Registration';
      default:
        return 'Brightloop Workspace';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 h-14 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb / Page Title */}
        <div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Active Role Badge */}
      <div className="flex items-center gap-2">
        {user?.role === 'customer' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Customer Portal: {user.company_name || user.name}</span>
          </span>
        ) : user?.role === 'staff' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>Sales Staff: {user.name}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin Lead (HQ Control)</span>
          </span>
        )}
      </div>
    </header>
  );
}

