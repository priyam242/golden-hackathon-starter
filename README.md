# ⚡ Golden Hackathon Monorepo Starter (with SpendX Suite)

> **One Monorepo. Production-Grade 2-Layer Architecture. Built for 24-48h Autonomous AI & Team Sprints.**

The **Golden Hackathon Starter** provides an immutable, modular spine paired with plug-and-play domain packs (including the full SpendX FinTech suite & Brightloop Recurring Billing engine) and reference implementations across 10 backend programming languages.

---

## 🏛️ Architecture Overview

```
D:\golden-hackathon-starter\
├── backend/
│   ├── core/                        # Immutable Spine (Never touched during hackathons)
│   │   ├── auth.py                  # JWT Auth + 1-Click Persona Switcher + RBAC
│   │   ├── envelope.py              # Universal JSON envelope & RFC 7807 error handler
│   │   ├── ai_engine.py             # SSE Chatbot & Gemini / Offline Receipt OCR parser
│   │   ├── files.py                 # File upload & secure stream (PDF, CSV, Images)
│   │   ├── realtime.py              # WebSocket hub (/ws/live) for instant dashboard alerts
│   │   ├── config.py                # Zero-hardcoding environment configuration
│   │   └── database.py              # SQLAlchemy 2.0 Async database engine
│   ├── modules/                     # Plug-and-Play Domain Packs
│   │   ├── spendx_suite/            # SpendX FinTech (Receipt OCR, Approvals, Currency, Budgets)
│   │   ├── billing_subscriptions/   # SaaS Recurring Revenue (Quotes, Subscriptions, Billing Run)
│   │   └── s01_core/                # Template clean sprint entity
│   ├── stacks/                      # 10 Reference Backend Framework Stacks (Untouched)
│   ├── main.py                      # Modular FastAPI application entrypoint
│   └── test_golden_suite.py         # Automated pytest test suite (10/10 passing)
├── frontend/                        # React 18 + Vite + Zustand + Tailwind + Bell MT
│   ├── src/
│   │   ├── components/spendx/       # ReceiptScannerModal, ApprovalPipeline, AnalyticsWidgets
│   │   ├── pages/                   # SpendxDashboard, Dashboard, Subscriptions, Invoices
│   │   └── utils/currency.js        # Multi-currency real-time conversions
│   └── package.json
├── shared/                          # Universal Tokens, Mock API & Test Harness
│   ├── api-client/client.js         # Fetch wrapper with auto-JWT & offline mock fallback
│   ├── design-tokens/               # theme.tokens.css (Bell MT serif, Monochrome + Escape hatch)
│   └── mock-api/mockAdapter.js      # Zero-config in-memory mock engine
└── scripts/
    ├── new-hackathon.ps1            # 1-Command project generator (< 1s execution)
    └── lint-theme.mjs               # Monochrome design lock linter
```

---

## 🚀 1-Command Hackathon Generator

Bootstrap a brand-new project with isolated branding, storage keys, and personas in under 1 second:

```powershell
# Clean Sprint Mode
.\scripts\new-hackathon.ps1 -Name "MediFlow" -Mode "clean"

# FinTech / Operations Mode (with SpendX Suite)
.\scripts\new-hackathon.ps1 -Name "SpendPro" -Mode "spendx"

# SaaS / Subscription Mode (with Billing Suite)
.\scripts\new-hackathon.ps1 -Name "SaaSKit" -Mode "saas"
```

---

## ⚡ Quick Start

### 1. Backend (FastAPI on Port 5000)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate       # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt # or: uv pip install -r requirements.txt
python main.py
```

### 2. Frontend (Vite on Port 5173)
```bash
cd frontend
bun install                   # or: pnpm install / npm install
bun run dev
```

### 3. Run Automated Tests
```bash
# Backend Test Suite (10/10 integration tests)
cd backend
pytest test_golden_suite.py -v

# Design Token Compliance
node scripts/lint-theme.mjs frontend/src
```

---

## 🎨 Owner's Design Lock & Theme Escape Hatch
- **Default Font**: **Bell MT** (`weights: 400 & 700 only`).
- **Default Theme**: **Pure Monochrome** (`#000000` / `#ffffff`).
- **Semantic Accent Escape Hatch**: Controlled by `"strictMonochrome": false` in `shared/design-tokens/theme.config.json` when color charts or badges are required.
