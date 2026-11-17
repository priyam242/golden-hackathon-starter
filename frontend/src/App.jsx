import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/ui/Sidebar';
import { TopHeader } from './components/ui/TopHeader';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Subscriptions } from './pages/Subscriptions';
import { Invoices } from './pages/Invoices';
import { ProductsPlans } from './pages/ProductsPlans';
import { Quotations } from './pages/Quotations';
import { SpendxDashboard } from './pages/SpendxDashboard';
import { NotFound } from './pages/NotFound';
import { useStore } from './store/useStore';
import { setTokens, apiClient } from '@shared/api-client/client';

export function App() {
  const { user, setUser } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('brightloop_user');
      const storedToken = localStorage.getItem('brightloop_access_token');
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          return;
        } catch {}
      }
      // Auto-authenticate as default Admin Lead with real JWT
      try {
        const res = await apiClient('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'admin@brightloop.com', password: 'Brightloop@2026' })
        });
        if (res?.data?.accessToken) {
          setTokens(res.data.accessToken, res.data.refreshToken);
          setUser(res.data.user);
        }
      } catch (e) {
        console.warn('Boot auto-login:', e);
      }
    };
    initAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex">
        
        {/* Left Sidebar holding ALL features */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
          {/* Top Header */}
          <TopHeader setMobileOpen={setMobileOpen} />

          {/* Main Content Pages */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/spendx" element={<SpendxDashboard />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/catalog" element={<ProductsPlans />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
