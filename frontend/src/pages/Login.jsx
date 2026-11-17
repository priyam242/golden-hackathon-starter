import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, setTokens } from '@shared/api-client/client';
import { useStore } from '../store/useStore';
import { ShieldCheck, Zap, User, Lock, Mail, ArrowRight } from 'lucide-react';

export function Login() {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res && res.data) {
        setTokens(res.data.accessToken, res.data.refreshToken);
        setUser(res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            B
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Brightloop Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to your subscription management workspace</p>
        </div>

        {/* Quick-fill Buttons */}
        <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Instant Demo Quick-Fill
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@brightloop.com', 'Brightloop@2026')}
              className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 text-center"
            >
              Admin Lead
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff@brightloop.com', 'Staff@2026')}
              className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 text-center"
            >
              Sales Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('shop@customer.com', 'Customer@2026')}
              className="py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 text-center"
            >
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need a customer account?{' '}
          <Link to="/register" className="font-bold text-slate-900 underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
