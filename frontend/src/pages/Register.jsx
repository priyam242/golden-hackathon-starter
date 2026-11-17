import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, setTokens } from '@shared/api-client/client';
import { useStore } from '../store/useStore';
import { Check, X, ShieldAlert, ArrowRight } from 'lucide-react';

export function Register() {
  const { setUser } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation rules from PDF
  const hasMinLength = password.length > 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasSpecialChar;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Password does not meet the complexity requirements.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiClient('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          company_name: companyName,
          password,
        }),
      });

      if (res && res.data) {
        setTokens(res.data.accessToken);
        setUser(res.data.user);
        alert('Welcome to Brightloop Software! Your customer portal is ready.');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            B
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Customer Account</h1>
          <p className="text-xs text-slate-500 mt-1">Access your subscriptions, invoices and self-service portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Company / Business Name</label>
            <input
              type="text"
              placeholder="e.g. Bakery Ltd or Tech Inc"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address (Unique)</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />

            {/* Password Criteria Checklist (Strict PDF rule) */}
            <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-[11px]">
              <div className="font-bold text-slate-600 mb-1">Password Rules (Odoo Spec):</div>
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-slate-400'}`}>
                {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                More than 8 characters (at least 9)
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-700' : 'text-slate-400'}`}>
                {hasUpperCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                At least one uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-700' : 'text-slate-400'}`}>
                {hasLowerCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                At least one lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-700' : 'text-slate-400'}`}>
                {hasSpecialChar ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                At least one special character (!@#$%^&*...)
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Sign Up'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-slate-900 underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
