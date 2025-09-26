# Side Pot

---

## Specification Deliverable

### Elevator pitch
When you’re self-employed, paychecks don’t automatically withhold taxes or fund retirement. **Side Pot** makes it simple: enter income and expenses to get a **monthly tax set-aside estimate**, see **basic contribution limits** for **Solo 401(k)**, **SEP IRA**, and **Roth IRA**, and **record what you actually set aside**. A small **real-time savings feed** (anonymized) shows others saving too, keeping you motivated.

> **Class disclaimer:** Educational demo only. **Not** tax or investment advice.

---

### Design

#### Mock

**Login / Landing**

![Side Pot – Login](docs/wireframes/sidepot-login.png)

**Dashboard**

![Side Pot – Dashboard](docs/wireframes/sidepot-dashboard.png)

**Planner (Tax & Retirement)**

![Side Pot – Planner](docs/wireframes/sidepot-planner.png)

**Contributions & Live Feed**

![Side Pot – Contributions](docs/wireframes/sidepot-contributions.png)

#### Interaction overview (sequence)
User → Frontend (React) → Backend (Express):
1. Register/Login (JWT in HTTP-only cookie)
2. Planner: POST `/api/planner/estimate` → returns `{percent, monthlySetAside}`
3. Contributions: GET/POST/DELETE `/api/contributions`
4. FX Helper: GET `/api/fx?base=EUR&amount=1000` (server calls free FX API)
5. WebSocket: server emits `savings_event` → clients update live ticker

---

### Key features
- Secure login (register/login/logout) over HTTPS
- **Tax set-aside estimator** (simple class formula; not advice)
- **Plan picker** with concise notes: Solo 401(k), SEP IRA, Roth IRA
- **Contribution tracker** for taxes and retirement accounts
- **Live savings feed** (WebSocket): “Someone just set aside $X”
- **3rd-party API**: FX conversion helper for foreign invoices (server-side proxy)

---

### Technologies
I am going to use the required technologies in the following ways:

- **HTML** – Semantic app shell with accessible forms (labels, inputs, buttons).
- **CSS** – Mobile-first responsive layout, good whitespace/contrast, small hover/active animations.
- **React** – Components & routing for:
  - `/` (Login), `/dashboard`, `/planner`, `/contributions`
  - State for auth, planner inputs/results, contributions, WebSocket feed.
- **Service (backend)** – Node/Express endpoints:
  - **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
  - **Planner**: `POST /api/planner/estimate` (deterministic classroom formula), `GET /api/planner/limits` (static cards)
  - **Contributions**: `GET /api/contributions`, `POST /api/contributions`, `DELETE /api/contributions/:id`
  - **3rd-party API**: `GET /api/fx?base=EUR&amount=1000` (server fetch to free FX API; demonstrates a service I didn’t write)
- **DB/Login** – Persist users (with bcrypt hash), profiles, and contributions (MongoDB/PostgreSQL, or a simple JSON DB for class). Register & login users; restrict contribution routes to authenticated users.
- **WebSocket** – Broadcast `savings_event` when contributions are added so all connected clients update their live ticker in real time.


## 🧩 Startup Deliverable: Initial HTML Structure for SidePot

### 📄 Overview
This commit includes the foundational HTML structure for the **SidePot** application — a self-employed planner for taxes and retirement contributions. The layout is based on wireframes and assignment specifications, and provides semantic structure, multi-page navigation, and placeholders for future functionality.

---

### ✅ What Was Added

#### 🔹 `index.html` (Homepage)
- Welcome message and login/register form
- Platform overview with feature explanation
- Parrot image added (`placeholder.jpg`)
- Navigation menu linking to other pages
- GitHub repo prominently linked in footer
- Placeholder: WebSocket-based savings ticker
- Placeholder: Display of user email after login

#### 🔹 `dashboard.html`
- Placeholder UI for plan selection (Solo 401(k), SEP IRA, Roth IRA)
- Quarterly tax estimator
- Contribution table (DB placeholder)
- WebSocket live feed
- Next deadline and reminder sections

#### 🔹 `planner.html`
- Inputs: income, filing status, state, expenses
- Estimated set-aside percentage and plan limits
- 3rd-party API placeholder for FX conversion
- "Record set-aside" interface stub

#### 🔹 `contributions.html`
- Contribution form and table (database placeholder)
- Live feed of anonymized activity (WebSocket placeholder)
- Button to export contributions as CSV
