import React, { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client/client';
import { useStore } from '../store/useStore';
import { 
  Receipt, 
  CheckCircle, 
  XCircle, 
  Send, 
  Printer, 
  DollarSign, 
  Zap, 
  AlertTriangle,
  Clock,
  Filter,
  FileQuestion
} from 'lucide-react';

export function Invoices() {
  const { user } = useStore();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: 'Credit Card',
    amount: '',
    note: '',
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiClient('/api/invoices');
      if (res && res.data) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const handleConfirm = async (id) => {
    try {
      await apiClient(`/api/invoices/${id}/confirm`, { method: 'POST' });
      fetchInvoices();
    } catch (err) {
      alert(`Confirm error: ${err.message}`);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this invoice?')) return;
    try {
      await apiClient(`/api/invoices/${id}/cancel`, { method: 'POST' });
      fetchInvoices();
    } catch (err) {
      alert(`Cancel error: ${err.message}`);
    }
  };

  const handleSend = async (id) => {
    try {
      const res = await apiClient(`/api/invoices/${id}/send`, { method: 'POST' });
      alert(res.message || 'Invoice sent to customer email successfully!');
      fetchInvoices();
    } catch (err) {
      alert(`Send error: ${err.message}`);
    }
  };

  const handlePrint = (id) => {
    const baseUrl = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000';
    window.open(`${baseUrl}/api/invoices/${id}/print`, '_blank');
  };

  const openPaymentModal = (inv) => {
    setPaymentModalInvoice(inv);
    setPaymentForm({
      method: 'Bank Transfer',
      amount: inv.total_amount,
      note: 'Settlement for ' + inv.invoice_number,
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    try {
      const res = await apiClient('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          invoice_id: paymentModalInvoice.id,
          method: paymentForm.method,
          amount: Number(paymentForm.amount),
          note: paymentForm.note,
        }),
      });
      alert(res.message || 'Payment recorded!');
      setPaymentModalInvoice(null);
      fetchInvoices();
    } catch (err) {
      alert(`Payment error: ${err.message}`);
    }
  };

  const filtered = invoices.filter((inv) => {
    if (filter === 'All') return true;
    if (filter === 'Overdue') return inv.is_overdue;
    return inv.status === filter;
  });

  const getStatusBadge = (status, isOverdue) => {
    if (isOverdue && status !== 'Paid') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 uppercase">
          Overdue
        </span>
      );
    }
    const map = {
      Draft: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      Confirmed: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      Paid: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      Cancelled: 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 line-through',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[status] || 'bg-slate-100 dark:bg-slate-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" /> Invoices & Billing Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Status pipeline: Draft &rarr; Confirmed &rarr; Paid. Automated tax rules and idempotency enforced.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Draft', 'Confirmed', 'Paid', 'Overdue', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table Container */}
      <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading invoices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FileQuestion className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No invoices found for "{filter}" filter
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {user?.role === 'customer' 
                ? 'You do not have any invoices matching this status in your customer portal.' 
                : 'Run a billing batch from the dashboard to generate due invoices from active subscriptions.'}
            </p>
            {filter !== 'All' && (
              <button
                onClick={() => setFilter('All')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline"
              >
                View All Invoices
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{inv.invoice_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{inv.customer_name}</td>
                    <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">{inv.sub_number || 'Direct/Ad-hoc'}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{inv.issue_date}</td>
                    <td className={`py-3 px-4 font-semibold ${inv.is_overdue && inv.status !== 'Paid' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {inv.due_date}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                      ${Number(inv.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(inv.status, inv.is_overdue)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Draft -> Confirm */}
                        {inv.status === 'Draft' && user?.role !== 'customer' && (
                          <button
                            onClick={() => handleConfirm(inv.id)}
                            title="Confirm Invoice"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-semibold text-[11px]"
                          >
                            Confirm
                          </button>
                        )}

                        {/* Record Payment */}
                        {inv.status === 'Confirmed' && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            title="Pay / Record Payment"
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3" /> Pay Now
                          </button>
                        )}

                        {/* Send Invoice */}
                        <button
                          onClick={() => handleSend(inv.id)}
                          title="Send to Customer"
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Print Invoice */}
                        <button
                          onClick={() => handlePrint(inv.id)}
                          title="Print / View Invoice"
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Cancel */}
                        {inv.status !== 'Paid' && inv.status !== 'Cancelled' && user?.role !== 'customer' && (
                          <button
                            onClick={() => handleCancel(inv.id)}
                            title="Cancel Invoice"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-200 dark:border-slate-700">
              Pay Invoice: {paymentModalInvoice.invoice_number}
            </h3>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Customer</label>
                <input
                  type="text"
                  disabled
                  value={paymentModalInvoice.customer_name}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="UPI">UPI Instant</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  placeholder="e.g. Wire transfer ref WIRE-8812"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
