import React, { useState } from 'react';
import { apiClient } from '@shared/api-client/client';
import { formatCurrency } from '../../utils/currency';

export function ReceiptScannerModal({ isOpen, onClose, onExpenseAdded }) {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);

  // Form Fields
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('General');
  const [tax, setTax] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (rawText) formData.append('raw_text', rawText);
        res = await apiClient('/api/spendx/extract-receipt', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await apiClient('/api/spendx/extract-receipt', {
          method: 'POST',
          body: JSON.stringify({ raw_text: rawText || 'Sample Starbucks $14.34 receipt' }),
        });
      }

      if (res?.data) {
        const d = res.data;
        setExtracted(d);
        setMerchant(d.merchant || '');
        setDate(d.date || new Date().toISOString().split('T')[0]);
        setAmount(d.totalAmount !== undefined ? String(d.totalAmount) : '');
        setCurrency(d.currency || 'USD');
        setCategory(d.category || 'General');
        setTax(d.taxAmount !== undefined ? String(d.taxAmount) : '0.00');
        setNotes(d.lineItems ? d.lineItems.map(i => `${i.description} (x${i.quantity})`).join(', ') : '');
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        merchant,
        date: date || new Date().toISOString().split('T')[0],
        amount: parseFloat(amount) || 0,
        currency,
        category,
        tax_amount: parseFloat(tax) || 0,
        notes,
      };
      const res = await apiClient('/api/spendx/expenses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res?.data) {
        if (onExpenseAdded) onExpenseAdded(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Submit expense error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-4">
          <div>
            <h3 className="text-xl font-bold font-serif tracking-tight text-neutral-900 dark:text-neutral-100">
              AI Receipt & Document OCR Scanner
            </h3>
            <p className="text-xs text-neutral-500 font-serif">
              Upload receipt image or bill text to extract structured expense items in 1 click.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-black dark:hover:text-white text-lg font-bold px-2"
          >
            ✕
          </button>
        </div>

        {/* 1. Extraction Source Area */}
        <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-4 mb-6 bg-neutral-50 dark:bg-neutral-950">
          <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-2">
            Upload Receipt File (Image / PDF)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-xs text-neutral-600 dark:text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white dark:file:bg-white dark:file:text-black hover:file:opacity-90 cursor-pointer"
          />

          <div className="mt-3">
            <label className="block text-xs font-serif uppercase tracking-wider font-bold mb-1">
              Or Paste Receipt / Invoice Raw Text:
            </label>
            <textarea
              rows={3}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="e.g. STARBUCKS Date: 2026-11-17 Total: $14.34..."
              className="w-full text-xs font-mono p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-serif font-bold rounded hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'AI Extracting...' : '✨ Run AI Auto-Fill'}
            </button>
          </div>
        </div>

        {/* 2. Structured Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Merchant / Vendor
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Starbucks, Uber, AWS..."
                className="w-full text-sm p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-serif uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-serif uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-serif uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-sm p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100"
              >
                <option value="General">General</option>
                <option value="Travel & Commute">Travel & Commute</option>
                <option value="Meals & Dining">Meals & Dining</option>
                <option value="Cloud & Software">Cloud & Software</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Tax Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-serif uppercase font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                Line Items & Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Itemized summary..."
                className="w-full text-sm p-2 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-black text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-serif font-bold text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-serif font-bold rounded hover:opacity-90 transition"
            >
              Submit for Multi-Step Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
