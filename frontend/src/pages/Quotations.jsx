import React, { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client/client';
import { useStore } from '../store/useStore';
import { 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  CheckCircle, 
  Clock, 
  Plus,
  Send
} from 'lucide-react';

export function Quotations() {
  const { user } = useStore();
  const [templates, setTemplates] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tplRes, quoRes] = await Promise.all([
        apiClient('/api/quotations/templates'),
        apiClient('/api/quotations'),
      ]);
      if (tplRes?.data) setTemplates(tplRes.data);
      if (quoRes?.data) setQuotations(quoRes.data);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateFromTemplate = async (templateId) => {
    try {
      const res = await apiClient('/api/quotations', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: 'usr_cust_shop',
          plan_id: 'plan_monthly',
          template_id: templateId,
          validity_days: 30,
        }),
      });
      alert(`New Quotation ${res.data?.quote_number} generated from template!`);
      fetchData();
    } catch (err) {
      alert(`Quote creation error: ${err.message}`);
    }
  };

  const handleConvert = async (quoteId) => {
    try {
      setConvertingId(quoteId);
      const res = await apiClient(`/api/quotations/${quoteId}/convert`, { method: 'POST' });
      alert(`Success: Quotation converted to active subscription #${res.data?.sub_number}!`);
      fetchData();
    } catch (err) {
      alert(`Conversion error: ${err.message}`);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Quotation Templates & Offers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fast sales offers: Reps start from pre-configured quotation templates and convert them into subscriptions with 1 click.
          </p>
        </div>
      </div>

      {/* Templates Section */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" /> Pre-Configured Quotation Templates
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Valid for {tpl.validity_days} days
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Template ID: {tpl.id}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{tpl.name}</h3>

                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Pre-included lines:</div>
                  {tpl.lines && tpl.lines.map((l, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-700">
                      <span>{l.variant_name || l.product_id} &times; {l.quantity}</span>
                      <span className="font-semibold">${(l.unit_price * l.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleCreateFromTemplate(tpl.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Start Offer from Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Quotations Pipeline */}
      <div className="mt-10 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Active Quotations Pipeline</h2>
            <p className="text-xs text-slate-500">Track and convert open quotes into live subscriptions.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No active quotations yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Quote #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Taxes</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{q.quote_number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {q.customer_id === 'usr_cust_shop' ? 'Corner Bakery Ltd' : 'Acme Global'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{q.valid_until}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">${Number(q.subtotal).toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-500">${Number(q.tax_amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">${Number(q.total_amount).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {q.status !== 'Confirmed' ? (
                        <button
                          onClick={() => handleConvert(q.id)}
                          disabled={convertingId === q.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {convertingId === q.id ? 'Converting...' : 'Convert to Subscription'}
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[11px] flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Converted
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
