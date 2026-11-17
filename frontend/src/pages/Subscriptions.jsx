import React, { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client/client';
import { useStore } from '../store/useStore';
import { 
  Repeat, 
  Pause, 
  Play, 
  RotateCw, 
  XCircle, 
  CheckCircle, 
  Filter, 
  Plus, 
  Eye, 
  Calendar,
  FileCheck,
  FileQuestion,
  Clock
} from 'lucide-react';

export function Subscriptions() {
  const { user } = useStore();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await apiClient('/api/subscriptions');
      if (res && res.data) {
        setSubscriptions(res.data);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const handlePauseResume = async (subId) => {
    try {
      await apiClient(`/api/subscriptions/${subId}/pause`, { method: 'POST' });
      fetchSubscriptions();
    } catch (err) {
      alert(`Action error: ${err.message}`);
    }
  };

  const handleRenew = async (subId) => {
    try {
      await apiClient(`/api/subscriptions/${subId}/renew`, { method: 'POST' });
      alert('Subscription renewed successfully for another billing cycle!');
      fetchSubscriptions();
    } catch (err) {
      alert(`Renew error: ${err.message}`);
    }
  };

  const handleCloseEarly = async (subId) => {
    if (!window.confirm('Are you sure you want to close this subscription early?')) return;
    try {
      await apiClient(`/api/subscriptions/${subId}/close`, { method: 'POST' });
      fetchSubscriptions();
    } catch (err) {
      alert(`Close error: ${err.message}`);
    }
  };

  const filtered = subscriptions.filter((s) => {
    if (filter === 'All') return true;
    return s.status === filter;
  });

  const getStatusBadge = (status) => {
    const map = {
      Active: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      Confirmed: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      Quotation: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      Draft: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      Paused: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      Closed: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[status] || 'bg-slate-100 dark:bg-slate-800'}`}>
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
            <Repeat className="w-6 h-6 text-blue-600" /> Subscription Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tracking lifecycle stages: Draft &rarr; Quotation &rarr; Confirmed &rarr; Active &rarr; Closed.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Active', 'Confirmed', 'Quotation', 'Draft', 'Paused', 'Closed'].map((tab) => (
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

      {/* Subscriptions Table */}
      <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Loading subscriptions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <FileQuestion className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No subscriptions found for "{filter}" filter
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {user?.role === 'customer' 
                ? 'No active subscriptions registered under your customer account.' 
                : 'Create a new quotation from templates and convert it to start a subscription.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase font-bold text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Sub Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan & Cadence</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4">Payment Terms</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {s.sub_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{s.customer_name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400">{s.customer_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{s.plan_name || 'Standard Plan'}</div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{s.billing_frequency}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div><span className="text-slate-400">Start:</span> {s.start_date}</div>
                      <div className="text-[10px] text-slate-500"><span className="text-slate-400">End:</span> {s.expiry_date || 'Ongoing'}</div>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-700 dark:text-slate-300">
                      {s.payment_terms || 'net_30'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(s.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSub(s)}
                          title="View Lines & Details"
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {s.status === 'Active' && (
                          <button
                            onClick={() => handlePauseResume(s.id)}
                            title="Pause Subscription"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}

                        {s.status === 'Paused' && (
                          <button
                            onClick={() => handlePauseResume(s.id)}
                            title="Resume Subscription"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        {['Active', 'Paused'].includes(s.status) && (
                          <button
                            onClick={() => handleRenew(s.id)}
                            title="Renew Subscription"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        )}

                        {s.status !== 'Closed' && (
                          <button
                            onClick={() => handleCloseEarly(s.id)}
                            title="Close Early"
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* Details Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Subscription Details: {selectedSub.sub_number}
              </h3>
              <button 
                onClick={() => setSelectedSub(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSub.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Plan:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSub.plan_name} ({selectedSub.billing_frequency})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span>{getStatusBadge(selectedSub.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Next Billing Date:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedSub.next_billing_date || 'Pending Run'}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="font-bold text-slate-700 dark:text-slate-200 mb-2">Subscription Product Lines:</div>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedSub.lines && selectedSub.lines.length > 0 ? (
                    selectedSub.lines.map((l, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{l.product_name}</div>
                          {l.variant_name && <div className="text-[10px] text-slate-500 dark:text-slate-400">Variant: {l.variant_name}</div>}
                          <div className="text-[10px] text-slate-400">Qty: {l.quantity} &times; ${l.unit_price}</div>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white text-right">
                          ${(Number(l.amount) || Number(l.unit_price) * Number(l.quantity) || 0).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-center py-2">No product lines registered</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
