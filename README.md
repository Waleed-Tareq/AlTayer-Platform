# Al-Tayer Super Admin Dashboard (V1)

High-fidelity interactive single-page Super Admin UI for **Al-Tayer** — a multi-tenant university campus food delivery and queue management platform.

## Run the dashboard

**Easiest:** double-click `Run Dashboard.bat`  
→ starts a local server and opens your browser (usually `http://127.0.0.1:8080/`).

**In Visual Studio:**
1. Right-click `index.html` → **View in Browser** (or Open With → browser), **or**
2. Double-click `Run Dashboard.bat` from Solution Explorer, **or**
3. Select **Al-Tayer Dashboard** as the startup item and press the green Run button (if shown).

**From a terminal:**

```bash
python serve.py
```

## Includes

- Dark fixed sidebar with Al-Tayer branding and nav
- Light main area with sticky glass header
- 4 metric cards (GMV, commission, students, active orders)
- Combined line + bar weekly chart (Chart.js)
- Live Orders Monitor table with status badges
- Hover states, profile dropdown, mobile sidebar toggle
