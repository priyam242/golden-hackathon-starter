import React, { useState } from 'react';
import { apiClient } from '@shared/api-client/client';
import { formatCurrency } from '../../utils/currency';

export function ApprovalPipeline({ expenses, onActionCompleted, activeRole = 'admin' }) {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState('approve');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAction = (exp, action) => {
    setSelectedExpense(exp);
    setActionType(action);
    setComments(action === 'approve' ? 'Approved in compliance with travel policy' : 'Requires further documentation');
  };

  const handleConfirmAction = async () => {
    if (!selectedExpense) return;
    setSubmitting(true);
    try {
      const res = await apiClient(`/api/spendx/expenses/${selectedExpense.id}/action`, {
        method: 'POST',
        body: JSON.stringify({
          action: actionType,
          comments,
        }),
      });
      if (res?.data) {
        if (onActionCompleted) onActionCompleted(res.data);
        setSelectedExpense(null);
      }
    } catch (err) {
      console.error('Approval action error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status, isFlagged) => {
    if (status === 'approved' || status === 'settled') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold border border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 rounded">
          {status}
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold border border-dashed border-neutral-400 text-neutral-500 rounded">
          Rejected
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-bold border border-neutral-400 text-neutral-900 dark:text-neutral-100 rounded">
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-black p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
        <div>
          <h3 className="text-lg font-bold font-serif text-neutral-900 dark:text-neutral-100">
            Multi-Step Approval Pipeline
          </h3>
          <p className="text-xs text-neutral-500 font-serif">
            Sequential tier approvals (Employee Submission → Manager Review → Admin Settlement).
          </p>
        </div>
        <div className="text-xs font-serif text-neutral-400">
          Role Filter: <span className="font-bold text-black dark:text-white uppercase">{activeRole}</span>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-400 font-serif">
          No expenses in the approval pipeline. Use the AI Receipt Scanner to submit a new claim.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-serif">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Merchant</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Original</th>
                <th className="py-2.5 px-3">Converted (USD)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950 transition">
                  <td className="py-3 px-3 font-mono">{exp.date}</td>
                  <td className="py-3 px-3 font-bold text-neutral-900 dark:text-neutral-100">
                    {exp.merchant}
                    {exp.isFlagged && (
                      <span className="ml-2 inline-block px-1.5 py-0.2 text-[9px] font-mono border border-neutral-500 text-neutral-500 rounded" title={exp.flagReasons}>
                        ⚠ Flagged
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-neutral-500">{exp.category}</td>
                  <td className="py-3 px-3 font-mono">
                    {formatCurrency(exp.amount, exp.currency)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    ${exp.convertedAmount?.toFixed(2) || exp.amount?.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    {getStatusBadge(exp.status, exp.isFlagged)}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    {exp.status.startsWith('pending') ? (
                      <>
                        <button
                          onClick={() => handleOpenAction(exp, 'approve')}
                          className="px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black rounded text-[11px] font-bold hover:opacity-80"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenAction(exp, 'reject')}
                          className="px-2.5 py-1 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 rounded text-[11px] hover:text-black dark:hover:text-white"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-mono">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Dialog Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold font-serif mb-2 text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
              {actionType === 'approve' ? 'Approve Expense Claim' : 'Reject Expense Claim'}
            </h4>
            <p className="text-xs text-neutral-500 font-serif mb-4">
              Reviewing: <strong>{selectedExpense.merchant}</strong> ({formatCurrency(selectedExpense.amount, selectedExpense.currency)})
            </p>

            {selectedExpense.isFlagged && (
              <div className="border border-neutral-300 dark:border-neutral-700 p-2.5 rounded mb-4 text-xs font-serif bg-neutral-50 dark:bg-neutral-950">
                <strong>Policy Notice:</strong> {selectedExpense.flagReasons}
              </div>
            )}

            <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1">
              Audit Comments
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full text-xs p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedExpense(null)}
                className="px-3 py-1.5 text-xs font-serif font-bold text-neutral-500 hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={submitting}
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black text-xs font-serif font-bold rounded hover:opacity-90"
              >
                {submitting ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
