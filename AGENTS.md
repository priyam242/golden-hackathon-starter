# AGENTS.md — Golden Hackathon Starter & Autonomous Sprint Protocol

> **Mission**: Build, iterate, and deploy high-impact, judge-winning solutions with zero hallucinations and clean vertical slices.

---

## 1. Antigravity Speed Protocol
- **Fast Package Managers**: Default to `uv` for Python (`uv pip install`) and `bun`/`pnpm` over `npm` for Node/TypeScript.
- **Zero-Hallucination SDK Docs**: Query `context7` MCP for live API signatures before implementing third-party libraries.
- **Codebase Indexing**: Use `graphify` MCP to map dependencies, detect god nodes, and trace project architecture.
- **Visual & Console Verification**:
  - Run `C:\Users\ppriy\.gemini\scripts\launch-debug-chrome.bat` to launch Chrome on remote debug port `9222`.
  - Use `chrome-devtools-mcp` to autonomously verify console logs, network errors, and visual screenshots.

---

## 2. 2-Layer Architecture Rules
1. **Never touch `backend/core/` during hackathon feature sprints**:
   - `auth.py`, `envelope.py`, `ai_engine.py`, `files.py`, `realtime.py` are production-hardened.
2. **Add feature code only in `backend/modules/` and `frontend/src/`**:
   - Create your feature router in `backend/modules/` and register in `backend/main.py`.
   - Build UI components in `frontend/src/` using `Bell MT` typography and `@shared/api-client/client`.

---

## 3. Sprint Execution Plan (Vertical Slices S01 -> S04)
- **`S01: Core Spine`**: Minimal end-to-end path (SQLAlchemy model in `backend/modules/` -> endpoint -> frontend wire).
- **`S02: Interactive UX`**: Full validation, multi-currency display, optimistic updates, and error handling.
- **`S03: Polish & Presentation`**: Ensure Bell MT font adherence, run `node scripts/lint-theme.mjs`, and verify responsive layout.
- **`S04: Instant Demo`**: Test 1-click persona switcher and offline mock mode (`VITE_USE_MOCK=true`).
