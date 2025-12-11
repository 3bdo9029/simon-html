# Side Pot

Side Pot is a small planning tool for self-employed people. It helps estimate how much to set aside for taxes each month, shows basic contribution limits for Solo 401(k), SEP IRA, and Roth IRA, and tracks what the user actually moves into those “pots.” A simple live feed shows anonymized savings events so users can see that other people are saving too.

Class disclaimer: this is an educational demo only. It is not tax or investment advice.

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
- Placeholder image added (`placeholder.jpg`)
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
## App overview

High-level flow:

- User registers or logs in (cookie-based authentication).
- User enters income and expenses in the planner to get an estimated tax set-aside percentage and monthly amount.
- User reviews plan options (Solo 401(k), SEP IRA, Roth IRA) and contribution limits.
- User records contributions for tax and retirement buckets.
- Each new contribution triggers a WebSocket event that appears in the live savings feed.

Main endpoints:

- Auth:  
  `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- Planner:  
  `POST /api/planner/estimate`, `GET /api/planner/limits`
- Contributions:  
  `GET /api/contributions`, `POST /api/contributions`, `DELETE /api/contributions/:id`
- FX helper:  
  `GET /api/fx?base=EUR&amount=1000`

Technologies:

- React + Vite (frontend)
- HTML and CSS for structure and layout
- Node.js + Express (backend)
- MongoDB (users and contributions)
- WebSocket (live savings feed)
- Deployed on AWS under the `startup` subdomain

---

## Startup deliverables (in course order)
1. Startup specification  
2. Startup AWS  
3. Startup HTML  
4. Startup CSS  
5. Startup React Phase 1: HTML/CSS  
6. Startup React Phase 2: Interactivity  
7. Startup Service  
8. Startup DB  
9. Startup WebSocket  

Each section below documents what was modified and added for that deliverable.
---

## Startup specification

**Goal:** Define the idea, target user, and main features of the startup.

What I did:

- Chose self-employed users (freelancers, independent contractors, side-hustle workers) as the target audience.
- Wrote the Side Pot elevator pitch, centered on:
  - monthly tax set-aside estimates,
  - retirement options (Solo 401(k), SEP IRA, Roth IRA),
  - recording actual contributions,
  - a small anonymized live savings feed.
- Created and documented four main screens:
  - Login / landing
  - Dashboard (summary)
  - Planner (tax and retirement)
  - Contributions (history and feed)
- Defined the core interaction pattern: React frontend → Express backend → MongoDB, plus a WebSocket channel for live events.
- Recorded decisions in `notes.md` so the later HTML, CSS, React, Service, DB, and WebSocket deliverables all follow the same concept.

---

## Startup AWS

**Goal:** Host the startup on the AWS instance and make it reachable through the startup subdomain.

What I did:

- Confirmed the AWS EC2 instance and security groups from earlier assignments.
- Configured DNS to point a `startup` subdomain at the EC2 instance.
- Served an initial version of the startup site over HTTPS and verified the certificate.
- Confirmed the directory layout on the server matches what the deployment scripts expect.
- Wrote basic deployment steps and any quirks (file permissions, script paths, etc.) in `notes.md`.

---

## Startup HTML

**Goal:** Build all the core HTML structure and placeholders, before styling and interactivity.

What I did:

### `index.html` (landing / login)

- Introductory text explaining Side Pot and why self-employed people need to plan for taxes and retirement.
- Login/register form with labeled inputs for email and password.
- Navigation links to:
  - Dashboard
  - Planner
  - Contributions
- Placeholder area to display the logged-in user’s name or email.
- Placeholder strip for a future “live savings feed.”
- Footer with a link to the GitHub repository and a clear disclaimer that this is not tax or investment advice.

### `dashboard.html`

- Section for “this month’s estimated tax set-aside.”
- Compact plan cards describing Solo 401(k), SEP IRA, and Roth IRA at a glance.
- Table placeholder for recent contributions (to later be backed by the database).
- Section for upcoming important dates, such as estimated tax deadlines.
- Box reserved at the bottom for the live savings feed text.

### `planner.html`

- Form inputs for:
  - gross income,
  - filing status,
  - state,
  - estimated business expenses,
  - optional foreign income for FX helper integration.
- Read-only placeholders for:
  - the estimated tax set-aside percentage,
  - the monthly set-aside amount,
  - plan limit cards for Solo 401(k), SEP IRA, and Roth IRA.
- “Record set-aside” area that will later call backend endpoints.

### `contributions.html`

- Form to add contributions, with fields for:
  - date,
  - amount,
  - category (tax, Solo 401(k), SEP IRA, Roth IRA),
  - notes.
- Table where contribution history will display once database integration is completed.
- Button placeholder to export contributions to CSV.
- Larger section reserved for WebSocket-driven feed entries such as “Someone just set aside 250 toward taxes.”

This covers the HTML deliverable requirements: distinct pages for application components, placeholders for authentication, database data, and WebSocket data, and `index.html` as the default entry point.

---

## Startup CSS

**Goal:** Style the HTML so the app looks like a real product, while keeping it responsive and readable.

What I did:

- Created a main stylesheet and wired it into the pages / React entry.
- Defined a simple design system:
  - neutral base background,
  - accent colors for key numbers and call-to-action elements,
  - consistent fonts and heading/body text sizes.
- Styled layout:
  - header and navigation bar with clear hover and active states,
  - content sections on Dashboard, Planner, and Contributions,
  - footer with GitHub link and disclaimer.
- Styled forms:
  - consistent styles for inputs, selects, and buttons,
  - clear spacing and alignment between labels and fields,
  - focus states for accessible keyboard navigation.
- Implemented responsive design:
  - mobile-first layout where sections stack vertically,
  - wider screens show planner inputs and results side-by-side, and contributions list with more columns visible.
- Styled placeholders:
  - ticker-like area for the future WebSocket live feed,
  - tables to match the app’s overall design so database data will “drop in” cleanly later.
- Verified styling using the browser dev tools and the dev server, and recorded CSS organization and decisions in `notes.md`.

---

## Startup React Phase 1: HTML/CSS

**Goal:** Convert the HTML/CSS version into a React + Vite application with routing, following the Simon React Phase 1 pattern.

What I did:

- Initialized a Vite React project inside the existing startup repo.
- Moved static assets (placeholder image, favicon, etc.) into `public/`.
- Created React components for the main views:
  - `LoginPage`,
  - `DashboardPage`,
  - `PlannerPage`,
  - `ContributionsPage`.
- Set up React Router with routes:
  - `/` → login/landing,
  - `/dashboard` → dashboard summary,
  - `/planner` → planner,
  - `/contributions` → contributions.
- Created a layout component that contains the shared header and footer so navigation does not cause a full reload.
- Translated the previous HTML into JSX while keeping the same structure and class names so that the CSS still applies.
- Ensured that:
  - my name appears in the app,
  - there is a clear link to the GitHub repo on the home page.
- Ran the app with `npm run dev`, inspected routing with browser dev tools, and documented the React structure in `notes.md`.

---

## Startup React Phase 2: Interactivity

**Goal:** Make the React components reactive and interactive, based on the patterns from Simon React Phase 2.

What I did:

- Added `useState` and `useEffect` where it matters:
  - login state in the login/landing view (later tied to the backend),
  - planner inputs and calculated values in the planner view,
  - in-memory contribution list in the contributions view.
- Implemented front-end logic:
  - a simple classroom-style tax set-aside formula that updates when inputs change,
  - adding and removing contributions in local state so the contribution list updates immediately.
- Prepared for services:
  - planner includes a place to show FX results from the backend,
  - live feed component stores a list of events that will later be fed by WebSocket messages.
- Used React dev tools and Vite’s dev server to debug interactivity and make sure the data flows between components are clear.
- Described the main state flows and any trade-offs in `notes.md` and committed changes regularly.

---

## Startup Service

**Goal:** Convert the startup into a web service using Node.js and Express, following the Simon Service structure and deployment pattern.

**This section is the README.md documentation for the Startup Service deliverable. It describes exactly what was modified and added so TAs can grade this part.**

### Prerequisites reviewed

Before starting this deliverable, I worked through the required topics:

- Web servers  
- Web Services Introduction  
- URL  
- Ports  
- HTTP  
- Modules  
- Fetch  
- Node web service  
- Express  
- Troubleshoot 502  
- SOP and CORS  
- Service design  
- Authorization services  
- Account creation and login  
- Simon service example  

These topics are important because the service deliverable requires calling third-party APIs, building a backend with Express, and supporting authentication and application endpoints.

### Project structure

To match the Simon pattern and the deployment script expectations, the project is organized like this:

```text
.                    // Project root
├── deployService.sh
├── .gitignore
├── index.html       // Frontend application entry (bundled by Vite)
├── index.jsx
├── package.json     // Frontend NPM configuration
├── public           // Images and other static files
│   └── ...
├── src              // React source files
│   └── ...
├── vite.config.js   // Vite dev proxy configuration
└── service          // Backend service code
    ├── index.js
    └── package.json // Backend NPM configuration

---

## Startup DB

**Goal:** Persist user accounts and contribution data in MongoDB (instead of in-memory storage) and support secure login for the Side Pot app.

### Prerequisites reviewed

Before building the DB layer, I reviewed and/or completed:

- Uploading files  
- Storage services  
- ☑ Data services  
- Simon DB  
- 🎥 MongoDB Atlas setup  

These topics helped me mirror the Simon DB pattern: using a MongoDB helper module, reading credentials from a config file, and wiring DB calls into the Express routes.

### Database setup

What I did:

- Created a **MongoDB Atlas** cluster for the startup project.
- Added a `dbConfig.json` file inside the `service/` folder (same pattern as Simon) containing:
  - `url` – the MongoDB connection string (no port in the `mongodb+srv://` URI),
  - `dbName` – a database name for Side Pot (for example, `sidepot`).
- Added `dbConfig.json` to **.gitignore** so secrets are not pushed to GitHub.
- Implemented a `service/database.js` module that:
  - Creates and reuses a single `MongoClient` connection.
  - Exposes helper functions for working with **users** and **contributions**.

### Collections and data model

I created the following collections:

- **`users`**
  - Fields (conceptual):
    - `email` (unique)
    - `passwordHash` (BCrypt hash)
    - `createdAt`
    - optional profile fields for display name
- **`contributions`**
  - Fields (conceptual):
    - `userId` (reference to `users._id`)
    - `type` (tax, Solo 401(k), SEP IRA, Roth IRA)
    - `amount`
    - `date`
    - `notes`
    - `createdAt`
    - `publicSummary` (short, anonymized message used by the WebSocket live feed)

Everything that was previously in memory for contributions is now stored in MongoDB.

### Auth: storing and retrieving credentials in MongoDB

I updated the **auth endpoints** to use MongoDB:

- `POST /api/auth/register`
  - Checks if a user with the given email already exists in `users`.
  - Uses **bcrypt** to hash the password.
  - Inserts a new user document with `email`, `passwordHash`, and `createdAt`.
  - Returns success and sets up the session cookie (same behavior as before, but backed by MongoDB).

- `POST /api/auth/login`
  - Looks up the user by `email` in the `users` collection.
  - Compares the provided password with the stored `passwordHash` using `bcrypt.compare`.
  - If valid, generates a session token and sets the cookie (session map is still in memory, but credentials live in MongoDB).

- `POST /api/auth/logout`
  - Clears the session token from the in-memory sessions map and removes the cookie.

This satisfies the rubric requirement that credentials are **stored and retrieved from MongoDB**, not hardcoded or stored in memory.

### Application data: contributions in MongoDB

I updated the contribution endpoints to persist data in MongoDB:

- `GET /api/contributions`
  - Uses the authenticated user’s ID (from the auth middleware) to query the `contributions` collection.
  - Returns the user’s contribution history, sorted by most recent.

- `POST /api/contributions`
  - Validates the request body (amount, type, date, notes).
  - Inserts a new document into the `contributions` collection, linking to the current user.
  - Returns the newly created contribution so the frontend can update immediately.

- `DELETE /api/contributions/:id`
  - Ensures the contribution belongs to the logged-in user.
  - Deletes the matching document from the `contributions` collection.

Planner calculations (tax set-aside) are still computed on the fly, but the **actual contributions** and the **user accounts** are now fully backed by MongoDB.

### Debugging and deployment

- Verified the DB integration locally with:
  - VS Code’s Node debugger attached to `service/index.js`.
  - Breakpoints inside `database.js` helpers and the auth/contributions routes.
- Checked queries and inserts in MongoDB Atlas to confirm documents were being created and updated correctly.
- Updated and reused `deployService.sh` with `-s startup` so that the **production** `startup` service also uses MongoDB credentials from `dbConfig.json`.
- Recorded DB setup steps, URI format notes, and common errors in `notes.md`.

---

## . Startup WebSocket

**Goal:** Add WebSocket support so that new contributions trigger live “Side Pot savings” events and appear in a real-time feed in the UI.

### Prerequisites reviewed

Before adding WebSocket support, I reviewed/completed:

- WebSocket  
- Debugging WebSocket  
- WebSocket chat  
- Simon WebSocket  

This helped me copy the Simon WebSocket pattern: a WebSocket server attached to the same HTTP server as Express, a client connection from the frontend, and broadcast of JSON messages.

### Backend: WebSocket server

In `service/index.js` I:

- Switched from `app.listen(...)` to an **HTTP server wrapper**:

    const http = require('http');
    const server = http.createServer(app);

- Created a WebSocket server using the **`ws`** library:

    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });

- On `connection`:
  - Sends a small welcome payload such as:  
    `{ "message": "Welcome to the Side Pot live savings feed!" }`
  - Keeps track of connected clients so I can broadcast later.

- Added a simple broadcast helper that:
  - Loops through all `wss.clients`.
  - Sends JSON messages only to clients with `readyState === WebSocket.OPEN`.
  - Catches and logs errors if a client disconnects unexpectedly.

The HTTP server now **listens on the same `port`** as the API and also handles WebSocket connections (same pattern as Simon WebSocket).

### Triggering WebSocket events from the app

I connected the WebSocket server to real app events:

- In `POST /api/contributions`:
  - After successfully inserting a new contribution into MongoDB, I build an anonymized **public event** object, for example:

    {
      "type": "contribution",
      "bucket": "Tax" | "Solo 401(k)" | "SEP IRA" | "Roth IRA",
      "amount": 250,
      "timestamp": "2025-12-10T22:15:00Z"
    }

  - This object does **not** include the user’s email or ID since the feed is meant to be generic.
  - I broadcast this object to all connected WebSocket clients via the broadcast helper.

Every time any authenticated user records a new contribution, everyone connected to the app sees a new event in the live savings feed.

### Frontend: WebSocket client and live feed

On the React side, I created a **LiveFeed** component that:

- Uses `useEffect` to open a WebSocket connection when the component mounts.
- Selects the correct URL based on environment:
  - Development: `ws://localhost:4000` (or proxied path).
  - Production: `wss://startup.<my-domain>`.
- Registers handlers:
  - `onopen` to log that the connection is live.
  - `onmessage` to parse incoming JSON events and push formatted feed lines such as  
    `"Someone just set aside $250 for taxes"` into component state.
  - `onerror` and `onclose` for basic diagnostics.
- Cleans up the WebSocket connection when the component unmounts.

I embedded the **LiveFeed** component in:

- The **Dashboard** (bottom “live savings feed” strip).
- The **Contributions** page (larger feed section).

This satisfies the rubric items for:

- Backend listens for WebSocket connection.
- Frontend makes a WebSocket connection.
- Data sent over WebSocket connection.
- WebSocket data displayed in the application interface.

### Vite dev proxy for WebSocket

To make WebSockets work cleanly during `npm run dev`:

- Updated `vite.config.js` to proxy WebSocket traffic to the backend service, similar to Simon WebSocket, for example:

    server: {
      proxy: {
        '/ws': {
          target: 'ws://localhost:4000',
          ws: true,
        },
      },
    }

- The frontend WebSocket client uses `/ws` in development so that Vite proxies the connection to the backend.

### Testing and deployment

- Local testing:
  - Opened the browser dev tools console and ran:

        let ws = new WebSocket("ws://localhost:4000");
        ws.onopen = () => console.log("CONNECTED");
        ws.onmessage = m => console.log("MESSAGE:", m.data);

  - Verified that:
    - A welcome message appears on connect.
    - Posting a new contribution from the UI triggers additional messages.

- Production testing:
  - Deployed with:

        ./deployService.sh -k <yourpemkey> -h <yourdomain> -s startup

  - Connected using `wss://startup.<my-domain>` in the browser console and confirmed:
    - WebSocket connection upgrades successfully over HTTPS.
    - Saving contributions in the production app produces new live feed entries in real time.

- Updated `notes.md` with:
  - How the WebSocket URL is constructed.
  - Common debugging steps (server logs, browser console, network tab).
  - Any gotchas around mixed HTTP/HTTPS or incorrect WS vs WSS URLs.

With this:

- Side Pot’s **auth and contributions** are now backed by MongoDB (Startup DB).
- The **live savings feed** is powered by a real WebSocket channel connected to actual contribution events (Startup WebSocket).