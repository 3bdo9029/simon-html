/* global WebSocket */
import React, { useEffect, useState } from 'react';
import './dashboard.css';

// One collapsible dashboard section: owns the open/closed state of its
// panel and kebab menu instead of hardcoded hidden attributes.
function DashSection({ icon, label, panelId, menuItems, children }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function togglePanel() {
    setOpen((prev) => !prev);
  }

  return (
    <section className="dash-item">
      <div
        className="dash-card"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={togglePanel}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePanel();
          }
        }}
      >
        <span className="icon">{icon}</span>
        <span className="label">{label}</span>

        <button
          className="menu-trigger"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
        >
          ⋯
        </button>

        <svg className="chev" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>

        {menuOpen && (
          <div className="dropdown open" role="menu">
            {menuItems.map((item, i) => (
              <React.Fragment key={item}>
                {i === menuItems.length - 1 && <hr />}
                <button
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                >
                  {item}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="dash-panel" id={panelId}>
          {children}
        </div>
      )}
    </section>
  );
}

// Live WebSocket feed: connects while the panel is open, cleans up on close
function LiveFeedPanel() {
  const [status, setStatus] = useState('Connecting…');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

    ws.onopen = () => setStatus('Connected to live feed');
    ws.onclose = () => setStatus('Disconnected');
    ws.onerror = () => setStatus('Error connecting');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'savings_event') {
          setEvents((prev) => [
            {
              id: Date.now() + Math.random(),
              message: `Someone just set aside $${data.amount ?? '—'}`,
              created: data.created || new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      } catch (err) {
        console.error('Invalid WebSocket message', err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <>
      <div className="inset">
        <label className="pill">
          <input type="checkbox" defaultChecked /> Live updates
        </label>
        <label className="pill">
          <input type="checkbox" /> Show 7-day avg
        </label>
        <label className="pill">
          <input type="checkbox" /> Show 30-day avg
        </label>
      </div>

      <div className="inset">
        <p className="live-status">Status: {status}</p>
        <ul className="live-list">
          {events.map((e) => (
            <li key={e.id}>{e.message}</li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button>Apply</button>
      </div>
    </>
  );
}

function DeadlinesPanel() {
  return (
    <>
      <div className="inset">
        <label className="field">
          Next due date <input type="date" />
        </label>
        <label className="field">
          Notify me
          <select>
            <option>3 days before</option>
            <option>1 week before</option>
            <option>2 weeks before</option>
          </select>
        </label>
      </div>
      <div className="actions">
        <button>Set reminder</button>
      </div>
    </>
  );
}

// Plan choice is controlled state, persisted locally until the service milestone
function PlanPanel() {
  const [selectedPlan, setSelectedPlan] = useState(() => {
    try {
      return localStorage.getItem('sidepot-plan') || '';
    } catch {
      return '';
    }
  });
  const [planStatus, setPlanStatus] = useState('');

  function handleSavePlan() {
    if (!selectedPlan) {
      setPlanStatus('Pick a plan first.');
      return;
    }
    try {
      localStorage.setItem('sidepot-plan', selectedPlan);
    } catch {
      // ignore
    }
    setPlanStatus(`Saved: ${selectedPlan}`);
  }

  const plans = ['Solo 401(k)', 'SEP IRA', 'Roth IRA'];

  return (
    <>
      <div className="inset">
        {plans.map((plan) => (
          <label className="pill" key={plan}>
            <input
              type="radio"
              name="plan"
              value={plan}
              checked={selectedPlan === plan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            />{' '}
            {plan}
          </label>
        ))}
      </div>
      <div className="actions">
        <button onClick={handleSavePlan}>Save selection</button>
      </div>
      {planStatus && <p className="live-status">{planStatus}</p>}
    </>
  );
}

// Estimator inputs are controlled state; Estimate computes the set-aside
function EstimatorPanel() {
  const [quarter, setQuarter] = useState('Q1');
  const [income, setIncome] = useState('');
  const [pct, setPct] = useState('');
  const [estimate, setEstimate] = useState(null);

  function handleEstimate() {
    const inc = Number(income);
    const p = Number(pct);
    if (!inc || inc <= 0 || !p || p <= 0) {
      setEstimate(null);
      return;
    }
    setEstimate(Math.round(inc * (p / 100)));
  }

  return (
    <>
      <div className="inset">
        <label className="field">
          Quarter{' '}
          <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
            <option>Q1</option>
            <option>Q2</option>
            <option>Q3</option>
            <option>Q4</option>
          </select>
        </label>
        <label className="field">
          Estimated net income{' '}
          <input type="number" placeholder="e.g., 24000" value={income} onChange={(e) => setIncome(e.target.value)} />
        </label>
        <label className="field">
          % set-aside{' '}
          <input type="number" placeholder="e.g., 30" value={pct} onChange={(e) => setPct(e.target.value)} />
        </label>
      </div>
      <div className="actions">
        <button onClick={handleEstimate}>Estimate</button>
      </div>
      {estimate !== null && (
        <p className="live-status">
          Set aside ${estimate.toLocaleString()} for {quarter}.
        </p>
      )}
    </>
  );
}

function RecordPanel() {
  return (
    <>
      <div className="inset">
        <label className="field">
          Amount <input type="number" placeholder="e.g., 500" />
        </label>
        <label className="field">
          Date <input type="date" />
        </label>
        <label className="field">
          Account
          <select>
            <option>Solo 401(k)</option>
            <option>SEP IRA</option>
            <option>Roth IRA</option>
          </select>
        </label>
      </div>
      <div className="actions">
        <button>Save</button>
      </div>
    </>
  );
}

function ContributionsFilterPanel() {
  return (
    <>
      <div className="inset">
        <label className="field">
          From <input type="date" />
        </label>
        <label className="field">
          To <input type="date" />
        </label>
        <label className="field">
          Account
          <select>
            <option>All</option>
            <option>Solo 401(k)</option>
            <option>SEP IRA</option>
            <option>Roth IRA</option>
          </select>
        </label>
      </div>
      <div className="actions">
        <button>Filter</button>
        <button className="secondary">Export CSV</button>
      </div>
    </>
  );
}

// Section configuration drives the dashboard layout
const SECTIONS = [
  {
    icon: '📡',
    label: 'Live feed & averages (WebSocket)',
    panelId: 'panel-live',
    menuItems: ['Pause stream', 'Refresh', 'Pop out'],
    Panel: LiveFeedPanel,
  },
  {
    icon: '⏰',
    label: 'Next deadline & reminders',
    panelId: 'panel-deadlines',
    menuItems: ['Add reminder', 'Sync to calendar', 'Help'],
    Panel: DeadlinesPanel,
  },
  {
    icon: '🧭',
    label: 'Pick a plan (Solo 401(k), SEP IRA, Roth IRA)',
    panelId: 'panel-plan',
    menuItems: ['Reset selection', 'Help / Docs', 'Hide from dashboard'],
    Panel: PlanPanel,
  },
  {
    icon: '💸',
    label: 'Quarterly tax estimator',
    panelId: 'panel-estimator',
    menuItems: ['View history', 'Clear inputs', 'Help'],
    Panel: EstimatorPanel,
  },
  {
    icon: '📝',
    label: 'Record a set-aside',
    panelId: 'panel-record',
    menuItems: ['Quick add $100', 'Quick add $500', 'Undo last'],
    Panel: RecordPanel,
  },
  {
    icon: '📊',
    label: 'Your contributions (table: date, account, amount)',
    panelId: 'panel-contribs',
    menuItems: ['Export CSV', 'Export PDF', 'Column preferences'],
    Panel: ContributionsFilterPanel,
  },
];

export function Dashboard() {
  return (
    <main className="dashboard-main">
      {SECTIONS.map(({ Panel, ...section }) => (
        <DashSection key={section.panelId} {...section}>
          <Panel />
        </DashSection>
      ))}
    </main>
  );
}
