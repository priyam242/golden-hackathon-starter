# AGENTS.md — {{NAME}} Autonomous Sprints & Protocol

> **Project**: {{NAME}} ({{MODE}} mode)  
> **Mission**: Build, iterate, and deploy high-impact, judge-winning solutions with zero hallucinations and clean vertical slices.

---

## 1. Antigravity Speed Protocol
- **Fast Package Managers**: Use `uv` for Python (`uv pip install`) and `bun`/`pnpm` for Node/TypeScript.
- **Zero-Hallucination SDK Docs**: Query `context7` MCP for live API signatures before implementing third-party libraries.
- **Codebase Indexing**: Use `graphify` MCP to map architecture and trace dependencies.
- **Visual & Console Verification**:
  - Run `C:\Users\ppriy\.gemini\scripts\launch-debug-chrome.bat` to launch Chrome on remote debug port `9222`.
  - Use `chrome-devtools-mcp` to inspect console logs and take UI screenshots.

---

## 2. Sprint Execution Plan (Vertical Slices S01 -> S04)
- **`S01: Core Spine`**: Implement DB model in `backend/modules/s01_core/models.py` and endpoints in `router.py`.
- **`S02: Interactive UX`**: Connect UI components in `frontend/src/` to API via `@shared/api-client/client`.
- **`S03: Polish & Presentation`**: Verify Bell MT typography and check theme adherence (`node scripts/lint-theme.mjs`).
- **`S04: Instant Demo`**: Test 1-click persona switcher and offline mock mode (`VITE_USE_MOCK=true`).

---

## 3. Quick Start Commands
```bash
# Backend (FastAPI on Port 5000)
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend (Vite on Port 5173)
cd frontend
bun install
bun run dev
```
