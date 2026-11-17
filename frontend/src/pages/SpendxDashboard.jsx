import React, { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client/client';
import { useStore } from '../store/useStore';
import { ReceiptScannerModal } from '../components/spendx/ReceiptScannerModal';
import { ApprovalPipeline } from '../components/spendx/ApprovalPipeline';
import { AnalyticsWidgets } from '../components/spendx/AnalyticsWidgets';
import { formatCurrency, convertCurrency } from '../utils/currency';

export function SpendxDashboard() {
  const { user } = useStore();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('USD');

  const loadData = async () => {
    try {
      const [expRes, bRes, aRes] = await Promise.all([
        apiClient('/api/spendx/expenses'),
        apiClient('/api/spendx/budgets'),
        apiClient('/api/spendx/analytics'),
      ]);
      if (expRes?.data) setExpenses(expRes.data);
      if (bRes?.data) setBudgets(bRes.data);
      if (aRes?.data) setAnalytics(aRes.data);
    } catch (e) {
      console.warn('Load SpendX data failed:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleExpenseAdded = (newExp) => {
    setExpenses((prev) => [newExp, ...prev]);
    loadData();
  };

  const handleActionCompleted = (updatedExp) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
    loadData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase font-bold border border-neutral-400 text-neutral-600 dark:text-neutral-400 rounded mb-1">
            SPENDX FINTECH MODULE
          </div>
          <h1 className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-100 tracking-tight">
            Corporate Expense & Policy Management
          </h1>
          <p className="text-xs text-neutral-500 font-serif">
            AI receipt extraction, multi-level sequential approvals, multi-currency conversion, and budget tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded p-1 text-xs font-serif bg-white dark:bg-black">
            <span className="text-neutral-400 px-2">Currency:</span>
            {['USD', 'INR', 'EUR', 'GBP'].map((c) => (
              <button
                key={c}
                onClick={() => setDisplayCurrency(c)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition ${
                  displayCurrency === c
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* AI Receipt Scanner Trigger */}
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-serif font-bold rounded shadow hover:opacity-90 transition flex items-center gap-1.5"
          >
            <span>✨</span> Scan Receipt
          </button>
        </div>
      </div>

      {/* Analytics & Budget Cards */}
      <AnalyticsWidgets analytics={analytics} budgets={budgets} />

      {/* Approval Pipeline */}
      <ApprovalPipeline
        expenses={expenses}
        onActionCompleted={handleActionCompleted}
        activeRole={user?.role || 'admin'}
      />

      {/* OCR Scanner Modal */}
      <ReceiptScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
}
