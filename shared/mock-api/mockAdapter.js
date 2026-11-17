import seedData from '../mock-seed/seed-data.json' with { type: 'json' };

// In-Memory state for mock sessions
let mockUsers = [...seedData.users];
let mockProducts = [...seedData.products];
let mockPlans = [...seedData.plans];
let mockDiscounts = [...seedData.discounts];
let mockTemplates = [...seedData.templates];
let mockQuotations = [...seedData.quotations];
let mockSubscriptions = [...seedData.subscriptions];
let mockInvoices = [...seedData.invoices];
let mockPayments = [...seedData.payments];
let currentMockUser = null;

let mockExpenses = [
  { id: 1, userId: 1, merchant: "Starbucks Coffee", date: "2026-11-17", amount: 14.34, currency: "USD", convertedAmount: 14.34, category: "Meals & Dining", taxAmount: 1.09, status: "approved", currentStep: 2, isFlagged: false, notes: "Client sync", auditTrail: [{ step: 1, action: "approve", actor: "admin@hackathon.internal" }] },
  { id: 2, userId: 1, merchant: "Delta Airlines", date: "2026-11-16", amount: 1250.00, currency: "USD", convertedAmount: 1250.00, category: "Travel & Commute", taxAmount: 95.00, status: "pending_admin", currentStep: 2, isFlagged: true, flagReasons: "High-value transaction: requires dual-tier executive approval", notes: "Flight to finals", auditTrail: [{ step: 1, action: "approve", actor: "manager@hackathon.internal" }] },
  { id: 3, userId: 1, merchant: "AWS Cloud Services", date: "2026-11-15", amount: 340.50, currency: "USD", convertedAmount: 340.50, category: "Cloud & Software", taxAmount: 0.00, status: "settled", currentStep: 3, isFlagged: false, notes: "Production hosting", auditTrail: [] }
];

let mockBudgets = [
  { id: 1, category: "Travel & Commute", monthlyCap: 3000, currentSpend: 1250, utilization: 41.7, isOverBudget: false },
  { id: 2, category: "Meals & Dining", monthlyCap: 1500, currentSpend: 480, utilization: 32.0, isOverBudget: false },
  { id: 3, category: "Cloud & Software", monthlyCap: 4000, currentSpend: 3650, utilization: 91.3, isOverBudget: false },
  { id: 4, category: "Office Supplies", monthlyCap: 1000, currentSpend: 320, utilization: 32.0, isOverBudget: false },
  { id: 5, category: "General", monthlyCap: 2000, currentSpend: 600, utilization: 30.0, isOverBudget: false },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockHandleRequest(endpoint, options = {}) {
  await sleep(60);

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
  const [path] = endpoint.split('?');

  // 1. Health
  if (path === '/api/health') {
    return {
      status: 'healthy',
      system: 'Brightloop Subscription Management Platform (Mock Mode)',
      environment: 'mock',
      timestamp: new Date().toISOString(),
    };
  }

  // 2. Auth: Login
  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    const user = mockUsers.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.status = 401;
      throw error;
    }
    currentMockUser = user;
    return {
      success: true,
      message: 'Authentication successful',
      data: {
        accessToken: `mock-jwt-${user.id}-${Date.now()}`,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, company_name: user.company_name },
      },
    };
  }

  // 3. Auth: Register
  if (path === '/api/auth/register' && method === 'POST') {
    const { name, email, password, company_name } = body;
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,}$/;
    if (!pwdRegex.test(password)) {
      const error = new Error('Password must be >8 characters with uppercase, lowercase and special character');
      error.status = 422;
      throw error;
    }
    const newUser = {
      id: `usr_cust_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'customer',
      company_name,
    };
    mockUsers.push(newUser);
    currentMockUser = newUser;
    return {
      success: true,
      message: 'Customer registered successfully',
      data: {
        accessToken: `mock-jwt-${newUser.id}`,
        user: newUser,
      },
    };
  }

  // 4. Products
  if (path === '/api/products' && method === 'GET') {
    return { success: true, data: mockProducts };
  }

  // 5. Plans
  if (path === '/api/plans' && method === 'GET') {
    return { success: true, data: mockPlans };
  }

  // 6. Quotation Templates
  if (path === '/api/quotations/templates' && method === 'GET') {
    return { success: true, data: mockTemplates };
  }

  // 7. Quotations
  if (path === '/api/quotations' && method === 'GET') {
    return { success: true, data: mockQuotations };
  }

  if (path.startsWith('/api/quotations/') && path.endsWith('/convert') && method === 'POST') {
    const quoteId = path.split('/')[3];
    const q = mockQuotations.find((item) => item.id === quoteId);
    const newSub = {
      id: `sub_${Date.now()}`,
      sub_number: `SUB-2026-${String(mockSubscriptions.length + 1).padStart(4, '0')}`,
      customer_id: q ? q.customer_id : 'usr_cust_shop',
      customer_name: 'Corner Bakery',
      plan_id: q ? q.plan_id : 'plan_monthly',
      plan_name: 'Brightloop Professional',
      status: 'Confirmed',
      start_date: new Date().toISOString().split('T')[0],
      payment_terms: q ? q.payment_terms : 'net_15',
      lines: q ? q.lines : [],
    };
    mockSubscriptions.unshift(newSub);
    return { success: true, data: newSub, message: 'Quotation converted to subscription' };
  }

  // 8. Subscriptions
  if (path === '/api/subscriptions' && method === 'GET') {
    return { success: true, data: mockSubscriptions };
  }

  if (path.startsWith('/api/subscriptions/') && path.endsWith('/pause') && method === 'POST') {
    const id = path.split('/')[3];
    const sub = mockSubscriptions.find((s) => s.id === id);
    if (sub) sub.status = sub.status === 'Paused' ? 'Active' : 'Paused';
    return { success: true, data: sub };
  }

  if (path.startsWith('/api/subscriptions/') && path.endsWith('/close') && method === 'POST') {
    const id = path.split('/')[3];
    const sub = mockSubscriptions.find((s) => s.id === id);
    if (sub) sub.status = 'Closed';
    return { success: true, data: sub };
  }

  // 9. Billing Day Run
  if (path === '/api/billing/run' && method === 'POST') {
    const newInv = {
      id: `inv_${Date.now()}`,
      invoice_number: `INV-2026-${String(mockInvoices.length + 1).padStart(4, '0')}`,
      subscription_id: 'sub_002',
      customer_name: 'Corner Bakery',
      status: 'Draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      total_amount: 1770.0,
      lines: [{ product_name: 'Brightloop Core ERP', quantity: 1, unit_price: 1500.0, total: 1770.0 }],
    };
    mockInvoices.unshift(newInv);
    return {
      success: true,
      data: {
        total_due_subscriptions: 1,
        invoices_generated: 1,
        invoices: [newInv],
      },
      message: 'Billing Day executed: 1 invoice generated',
    };
  }

  // 10. Invoices
  if (path === '/api/invoices' && method === 'GET') {
    return { success: true, data: mockInvoices };
  }

  if (path.startsWith('/api/invoices/') && path.endsWith('/confirm') && method === 'POST') {
    const id = path.split('/')[3];
    const inv = mockInvoices.find((i) => i.id === id);
    if (inv) inv.status = 'Confirmed';
    return { success: true, data: inv, message: 'Invoice confirmed' };
  }

  // 11. Discounts
  if (path === '/api/discounts' && method === 'GET') {
    return { success: true, data: mockDiscounts };
  }

  // 12. Payments
  if (path === '/api/payments' && method === 'GET') {
    return { success: true, data: mockPayments };
  }

  if (path === '/api/payments' && method === 'POST') {
    const { invoice_id, method: payMethod, amount, note } = body;
    const inv = mockInvoices.find((i) => i.id === invoice_id);
    if (inv) inv.status = 'Paid';
    const newPay = {
      id: `pay_${Date.now()}`,
      invoice_id,
      invoice_number: inv ? inv.invoice_number : 'INV-2026-X',
      customer_name: inv ? inv.customer_name : 'Customer',
      method: payMethod,
      amount,
      payment_date: new Date().toISOString().split('T')[0],
      note,
    };
    mockPayments.unshift(newPay);
    return { success: true, data: newPay, message: 'Payment recorded successfully' };
  }

  // 13. Finance Lead Dashboard
  if (path === '/api/finance/dashboard' && method === 'GET') {
    const activeCount = mockSubscriptions.filter((s) => s.status === 'Active').length;
    const overdueInvoices = mockInvoices.filter((i) => i.is_overdue && i.status !== 'Paid');
    const totalRev = mockPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const overdueTotal = overdueInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0);
    const outstandingTotal = mockInvoices
      .filter((i) => i.status !== 'Paid' && !i.is_overdue)
      .reduce((sum, i) => sum + Number(i.total_amount), 0);

    return {
      success: true,
      data: {
        active_subscriptions: activeCount,
        total_subscriptions: mockSubscriptions.length,
        total_revenue_collected: totalRev,
        total_outstanding_revenue: outstandingTotal,
        total_overdue_revenue: overdueTotal,
        overdue_invoices_count: overdueInvoices.length,
        overdue_invoices: overdueInvoices,
        estimated_mrr: 1850.0,
        response_time_ms: 3,
      },
    };
  }

  // 14. SpendX Suite
  if (path === '/api/spendx/extract-receipt') {
    return {
      success: true,
      data: {
        merchant: "Starbucks Coffee",
        date: new Date().toISOString().split('T')[0],
        totalAmount: 14.34,
        currency: "USD",
        convertedAmount: 14.34,
        taxAmount: 1.09,
        category: "Meals & Dining",
        lineItems: [
          { description: "Caramel Macchiato", quantity: 1, unitPrice: 5.75, total: 5.75 },
          { description: "Blueberry Muffin", quantity: 2, unitPrice: 3.75, total: 7.50 }
        ],
        confidence: 0.96,
        engine: "mock_offline"
      },
      message: "Receipt extracted successfully (Mock)"
    };
  }

  if (path === '/api/spendx/expenses' && method === 'GET') {
    return { success: true, data: mockExpenses };
  }

  if (path === '/api/spendx/expenses' && method === 'POST') {
    const newExp = {
      id: mockExpenses.length + 1,
      userId: 1,
      merchant: body.merchant || "New Merchant",
      date: body.date || new Date().toISOString().split('T')[0],
      amount: Number(body.amount) || 0,
      currency: body.currency || "USD",
      convertedAmount: Number(body.amount) || 0,
      category: body.category || "General",
      taxAmount: Number(body.tax_amount) || 0,
      status: "pending_manager",
      currentStep: 1,
      isFlagged: Number(body.amount) > 1000,
      flagReasons: Number(body.amount) > 1000 ? "High-value transaction: requires dual-tier executive approval" : "",
      notes: body.notes || "",
      auditTrail: [{ step: 0, action: "submitted", actor: "alex@demo.internal" }]
    };
    mockExpenses.unshift(newExp);
    return { success: true, data: newExp, message: "Expense submitted successfully" };
  }

  if (path.startsWith('/api/spendx/expenses/') && path.endsWith('/action') && method === 'POST') {
    const parts = path.split('/');
    const expId = parseInt(parts[4]);
    const exp = mockExpenses.find(e => e.id === expId);
    if (exp) {
      if (body.action === 'reject') exp.status = 'rejected';
      else if (body.action === 'settle') exp.status = 'settled';
      else if (body.action === 'approve') exp.status = exp.convertedAmount > 1000 && exp.currentStep === 1 ? 'pending_admin' : 'approved';
      exp.auditTrail.push({ step: exp.currentStep, action: body.action, comments: body.comments, actor: "reviewer@demo.internal" });
      return { success: true, data: exp, message: `Expense marked as ${exp.status}` };
    }
  }

  if (path === '/api/spendx/budgets') {
    return { success: true, data: mockBudgets };
  }

  if (path === '/api/spendx/analytics') {
    const totalSettled = mockExpenses.filter(e => ['approved', 'settled'].includes(e.status)).reduce((s, e) => s + e.convertedAmount, 0);
    const pendingAmount = mockExpenses.filter(e => e.status.startsWith('pending')).reduce((s, e) => s + e.convertedAmount, 0);
    return {
      success: true,
      data: {
        totalSpendSettled: Math.round(totalSettled * 100) / 100,
        pendingApprovalAmount: Math.round(pendingAmount * 100) / 100,
        totalTransactions: mockExpenses.length,
        anomalyAlertsCount: mockExpenses.filter(e => e.isFlagged).length,
        baseCurrency: "USD"
      }
    };
  }

  if (path === '/api/spendx/currency/rates') {
    return {
      success: true,
      data: {
        baseCurrency: "USD",
        rates: { USD: 1.0, INR: 86.5, EUR: 0.95, GBP: 0.80 }
      }
    };
  }

  // 15. Personas Switcher
  if (path === '/api/auth/personas') {
    return {
      success: true,
      data: {
        personas: [
          { id: 1, email: "admin@hackathon.internal", fullName: "Lead Architect (Admin)", role: "admin", quickToken: "mock-jwt-admin" },
          { id: 2, email: "manager@hackathon.internal", fullName: "Finance Approver (Manager)", role: "manager", quickToken: "mock-jwt-manager" },
          { id: 3, email: "employee@hackathon.internal", fullName: "Alex Rivera (Employee)", role: "user", quickToken: "mock-jwt-user" },
          { id: 4, email: "customer@acme.com", fullName: "Sarah Connor (Client)", role: "customer", quickToken: "mock-jwt-customer" }
        ]
      }
    };
  }

  if (path === '/api/auth/switch-persona') {
    const role = body.role || 'admin';
    return {
      success: true,
      data: {
        accessToken: `mock-jwt-${role}-${Date.now()}`,
        user: { id: 1, email: `${role}@hackathon.internal`, fullName: `Demo ${role.toUpperCase()}`, role }
      }
    };
  }

  // Fallback
  return { success: true, data: null, message: `Mock handled ${method} ${path}` };
}
