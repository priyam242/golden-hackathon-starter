import React, { useState, useEffect } from 'react';
import { apiClient } from '@shared/api-client/client';
import { useStore } from '../store/useStore';
import { 
  Package, 
  Layers, 
  Tag, 
  Plus, 
  Calendar, 
  Check, 
  Clock, 
  Percent, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

export function ProductsPlans() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Product Modal Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodForm, setProdForm] = useState({
    name: '',
    type: 'software',
    sales_price: '',
    cost_price: '',
    notes: '',
    variant_name: '',
    variant_price: '',
  });

  // New Plan Modal Form
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: '',
    cost: '',
    billing_frequency: 'monthly',
    min_quantity: 1,
    auto_close_on_end: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodsRes, plansRes, discRes] = await Promise.all([
        apiClient('/api/products'),
        apiClient('/api/plans'),
        apiClient('/api/discounts'),
      ]);
      if (prodsRes?.data) setProducts(prodsRes.data);
      if (plansRes?.data) setPlans(plansRes.data);
      if (discRes?.data) setDiscounts(discRes.data);
    } catch (err) {
      console.error('Error fetching catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const variants = [];
      if (prodForm.variant_name) {
        variants.push({
          name: prodForm.variant_name,
          extra_price: Number(prodForm.variant_price) || 0,
        });
      }
      await apiClient('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: prodForm.name,
          type: prodForm.type,
          sales_price: Number(prodForm.sales_price),
          cost_price: Number(prodForm.cost_price),
          notes: prodForm.notes,
          variants,
        }),
      });
      alert('Product created successfully!');
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      alert(`Error creating product: ${err.message}`);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await apiClient('/api/plans', {
        method: 'POST',
        body: JSON.stringify({
          name: planForm.name,
          cost: Number(planForm.cost),
          billing_frequency: planForm.billing_frequency,
          min_quantity: Number(planForm.min_quantity),
          auto_close_on_end: planForm.auto_close_on_end,
        }),
      });
      alert('Subscription plan configured successfully!');
      setShowPlanModal(false);
      fetchData();
    } catch (err) {
      alert(`Error creating plan: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Catalog, Plans & Discounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure products with brand variants (e.g. Odoo brand +$560), multi-frequency recurring plans, and discount rules.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Products & Variants
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'plans' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeTab === 'discounts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Discounts Engine
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900">Products & Add-ons with Variants</h2>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Product
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {p.type}
                    </span>
                    <span className="font-black text-slate-900 text-base">${p.sales_price}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{p.notes || 'Core software module'}</p>

                  {/* Variants display */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" /> Available Variants:
                    </div>
                    {p.variants && p.variants.length > 0 ? (
                      <div className="space-y-1">
                        {p.variants.map((v, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            <span className="font-medium text-slate-800">{v.name}</span>
                            <span className="font-bold text-slate-900">
                              {v.extra_price > 0 ? `+ $${v.extra_price}` : 'Base Price'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">No variants (Standard unit)</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                  <span>Cost: ${p.cost_price}</span>
                  <span className="text-emerald-600 font-semibold">Margin: ${(p.sales_price - p.cost_price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Subscription Plans */}
      {activeTab === 'plans' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900">Multi-Frequency Recurring Plans</h2>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowPlanModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Launch New Plan
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((pl) => (
              <div key={pl.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {pl.billing_frequency}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3">{pl.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">${pl.cost}</span>
                    <span className="text-xs text-slate-500">/ {pl.billing_frequency}</span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Quantity:</span>
                      <span className="font-semibold">{pl.min_quantity} seat(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lifecycle Rule:</span>
                      <span className="font-semibold text-slate-800">
                        {pl.auto_close_on_end ? 'Auto-closes on end' : 'Pause/Renew allowed'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  {pl.end_date ? `Available until ${pl.end_date}` : 'Perpetual Catalog Plan'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Discounts Engine */}
      {activeTab === 'discounts' && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Configured Discount Rules</h2>
              <p className="text-xs text-slate-500">Auto-applied to next invoice when min quantity/purchase thresholds are met.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Type & Value</th>
                  <th className="py-3 px-4">Thresholds</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Usage Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{d.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {d.type === 'percentage' ? `${d.value}% Off` : `$${d.value} Flat Off`}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>Min Qty: {d.min_quantity}</div>
                      {d.min_purchase > 0 && <div className="text-[10px] text-slate-400">Min Purchase: ${d.min_purchase}</div>}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-slate-700">
                      {d.scope.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {d.current_uses} / {d.max_uses} used
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-200">
              Add New Product (Brightloop Catalog)
            </h3>
            <form onSubmit={handleCreateProduct} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop CRM Module"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sales Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.sales_price}
                    onChange={(e) => setProdForm({ ...prodForm, sales_price: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.cost_price}
                    onChange={(e) => setProdForm({ ...prodForm, cost_price: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Type</label>
                <select
                  value={prodForm.type}
                  onChange={(e) => setProdForm({ ...prodForm, type: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                >
                  <option value="software">Software</option>
                  <option value="addon">Addon</option>
                  <option value="service">Service</option>
                  <option value="physical">Physical</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-700 mb-1">Product Variant (e.g. Odoo brand +$560)</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Variant name (e.g. Odoo Brand)"
                    value={prodForm.variant_name}
                    onChange={(e) => setProdForm({ ...prodForm, variant_name: e.target.value })}
                    className="p-1.5 border border-slate-300 rounded bg-white"
                  />
                  <input
                    type="number"
                    placeholder="Extra Price ($)"
                    value={prodForm.variant_price}
                    onChange={(e) => setProdForm({ ...prodForm, variant_price: e.target.value })}
                    className="p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-200">
              Launch New Subscription Plan
            </h3>
            <form onSubmit={handleCreatePlan} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starter Monthly"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={planForm.cost}
                    onChange={(e) => setPlanForm({ ...planForm, cost: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Billing Frequency</label>
                  <select
                    value={planForm.billing_frequency}
                    onChange={(e) => setPlanForm({ ...planForm, billing_frequency: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Minimum Quantity (Seats)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={planForm.min_quantity}
                  onChange={(e) => setPlanForm({ ...planForm, min_quantity: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="auto_close"
                  checked={planForm.auto_close_on_end}
                  onChange={(e) => setPlanForm({ ...planForm, auto_close_on_end: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="auto_close" className="text-slate-700 font-medium">
                  Auto-close subscription when end date is reached
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Publish Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
