import React from 'react';
import { formatCurrency } from '../../utils/currency';

export function AnalyticsWidgets({ analytics, budgets = [] }) {
  const handleExportCSV = () => {
    window.open('/api/spendx/reports/export?format=csv', '_blank');
  };

  const handlePrintReport = () => {
    window.open('/api/spendx/reports/export?format=html', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-black shadow-sm">
          <div className="text-[11px] font-serif uppercase tracking-wider text-neutral-400">Total Settled</div>
          <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-100 mt-1">
            ${(analytics?.totalSpendSettled || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 font-serif mt-1">Base Currency: USD</div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-black shadow-sm">
          <div className="text-[11px] font-serif uppercase tracking-wider text-neutral-400">Pending Approvals</div>
          <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-100 mt-1">
            ${(analytics?.pendingApprovalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-neutral-500 font-serif mt-1">Awaiting reviewer action</div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-black shadow-sm">
          <div className="text-[11px] font-serif uppercase tracking-wider text-neutral-400">Total Ingested</div>
          <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-100 mt-1">
            {analytics?.totalTransactions || 0}
          </div>
          <div className="text-[10px] text-neutral-500 font-serif mt-1">Claims processed</div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-black shadow-sm">
          <div className="text-[11px] font-serif uppercase tracking-wider text-neutral-400">Policy Flags</div>
          <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-neutral-100 mt-1">
            {analytics?.anomalyAlertsCount || 0}
          </div>
          <div className="text-[10px] text-neutral-500 font-serif mt-1">Over-limit / anomalous</div>
        </div>
      </div>

      {/* 2. Budget Caps & Utilization Meters */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 bg-white dark:bg-black shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold font-serif text-neutral-900 dark:text-neutral-100">
              Department & Category Budget Discipline
            </h3>
            <p className="text-xs text-neutral-500 font-serif">
              Real-time utilization meters against monthly spending caps.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 text-xs font-serif font-bold rounded hover:border-black dark:hover:border-white transition"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handlePrintReport}
              className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black text-xs font-serif font-bold rounded hover:opacity-90 transition"
            >
              🖨 Printable Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const pct = Math.min(Math.round((b.currentSpend / b.monthlyCap) * 100), 100);
            return (
              <div key={b.category} className="border border-neutral-100 dark:border-neutral-900 rounded-lg p-3">
                <div className="flex justify-between items-center text-xs font-serif mb-1.5">
                  <span className="font-bold">{b.category}</span>
                  <span className="font-mono text-neutral-500">
                    ${b.currentSpend?.toFixed(0)} / ${b.monthlyCap?.toFixed(0)} ({pct}%)
                  </span>
                </div>
                {/* Monochrome progress bar */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-black dark:bg-white h-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {b.isOverBudget && (
                  <div className="text-[10px] font-mono mt-1 text-neutral-500">
                    ⚠ Over budget cap
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
