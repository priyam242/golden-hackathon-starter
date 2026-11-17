import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  CheckCircle2, 
  ArrowRight, 
  Repeat, 
  Receipt, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  BarChart3,
  Calendar,
  Sparkles,
  Store,
  Briefcase
} from 'lucide-react';

export function Landing() {
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleQuickDemo = (role) => {
    let mockUser;
    let targetPath = '/dashboard';
    if (role === 'admin') {
      mockUser = { id: 'usr_admin', name: 'Admin Lead', email: 'admin@brightloop.com', role: 'admin', company_name: 'Brightloop HQ' };
      targetPath = '/dashboard';
    } else if (role === 'staff') {
      mockUser = { id: 'usr_staff', name: 'Sara Sales Rep', email: 'staff@brightloop.com', role: 'staff', company_name: 'Brightloop Sales' };
      targetPath = '/quotations';
    } else {
      mockUser = { id: 'usr_cust_shop', name: 'Corner Bakery', email: 'shop@customer.com', role: 'customer', company_name: 'Corner Bakery Ltd' };
      targetPath = '/subscriptions';
    }
    setUser(mockUser);
    navigate(targetPath);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Odoo Hackathon Challenge 2026 — Brightloop System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            The Digital Backbone for <br />
            <span className="text-blue-600 dark:text-blue-400">Recurring Billing & Subscriptions</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            One unified software platform that runs the full life of Brightloop Software’s subscription business. From product brand variants and quotation templates to 1-click billing day runs and overdue chasing.
          </p>

          {/* Quick Persona Open Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Open Admin Account
            </button>
            <button
              onClick={() => handleQuickDemo('staff')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 dark:bg-slate-800 hover:bg-blue-700 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <Briefcase className="w-4 h-4" />
              Open Sales Staff Account
            </button>
            <button
              onClick={() => handleQuickDemo('customer')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs shadow-sm transition-all hover:scale-105"
            >
              <Store className="w-4 h-4 text-emerald-500" />
              Open Customer Portal (Corner Bakery)
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Click any button above to instantly enter that persona's live workspace.
          </div>
        </div>
      </section>

      {/* Before & After Matrix (From PDF Scenes) */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            How Brightloop Ran Before vs How It Runs Today
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Solving the exact 4 spreadsheet problems from the Odoo challenge document.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <Repeat className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Before: Spreadsheets</div>
            <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-2">Automated Lifecycle</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Subscriptions tracked across Draft, Quotation, Confirmed, Active, and Closed with automatic pause & renew rules.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Before: Missed Renewals</div>
            <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-2">Smart Expiry & Auto-Close</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Plans configured plan-by-plan: auto-close on expiry date, or allow manual pause, renewal, and early closures.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Before: Hand-typed Invoices</div>
            <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-2">Billing Day Batch Run</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Hundreds of invoices generated with 1 click. Taxes, variants, and discounts applied. Zero double-billing.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Before: Days for Finance Lead</div>
            <h3 className="font-bold text-slate-900 dark:text-white mt-1 mb-2">Sub-2s Executive Intel</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Instant visibility into active subscriptions, collected revenue, outstanding cash, and overdue invoices to chase.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
