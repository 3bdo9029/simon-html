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

export function Dashboard() {
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
    <main>
      <DashSection
        icon="📡"
        label="Live feed & averages (WebSocket)"
        panelId="panel-live"
        menuItems={['Pause stream', 'Refresh', 'Pop out']}
      >
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

        {/* WebSocket status + feed */}
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
      </DashSection>

      <DashSection
        icon="⏰"
        label="Next deadline & reminders"
        panelId="panel-deadlines"
        menuItems={['Add reminder', 'Sync to calendar', 'Help']}
      >
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
      </DashSection>

      <DashSection
        icon="🧭"
        label="Pick a plan (Solo 401(k), SEP IRA, Roth IRA)"
        panelId="panel-plan"
        menuItems={['Reset selection', 'Help / Docs', 'Hide from dashboard']}
      >
        <div className="inset">
          <label className="pill">
            <input type="radio" name="plan" value="solo401k" /> Solo 401(k)
          </label>
          <label className="pill">
            <input type="radio" name="plan" value="sep" /> SEP IRA
          </label>
          <label className="pill">
            <input type="radio" name="plan" value="roth" /> Roth IRA
          </label>
        </div>
        <div className="actions">
          <button>Save selection</button>
        </div>
      </DashSection>

      <DashSection
        icon="💸"
        label="Quarterly tax estimator"
        panelId="panel-estimator"
        menuItems={['View history', 'Clear inputs', 'Help']}
      >
        <div className="inset">
          <label className="field">
            Quarter{' '}
            <select>
              <option>Q1</option>
              <option>Q2</option>
              <option>Q3</option>
              <option>Q4</option>
            </select>
          </label>
          <label className="field">
            Estimated net income <input type="number" placeholder="e.g., 24000" />
          </label>
          <label className="field">
            % set-aside <input type="number" placeholder="e.g., 30" />
          </label>
        </div>
        <div className="actions">
          <button>Estimate</button>
        </div>
      </DashSection>

      <DashSection
        icon="📝"
        label="Record a set-aside"
        panelId="panel-record"
        menuItems={['Quick add $100', 'Quick add $500', 'Undo last']}
      >
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
      </DashSection>

      <DashSection
        icon="📊"
        label="Your contributions (table: date, account, amount)"
        panelId="panel-contribs"
        menuItems={['Export CSV', 'Export PDF', 'Column preferences']}
      >
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
      </DashSection>
    </main>
  );
}
