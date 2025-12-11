/* global WebSocket */
import React, { useEffect, useState } from 'react';
import './dashboard.css';

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
      {/* Live feed */}
      <section className="dash-item">
        <div
          className="dash-card"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          aria-controls="panel-live"
        >
          <span className="icon">📡</span>
          <span className="label">Live feed &amp; averages (WebSocket)</span>

          <button
            className="menu-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="menu-live"
          >
            ⋯
          </button>

          <svg className="chev" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>

          <div className="dropdown" id="menu-live" role="menu" hidden>
            <button role="menuitem" data-action="pause">
              Pause stream
            </button>
            <button role="menuitem" data-action="refresh">
              Refresh
            </button>
            <hr />
            <button role="menuitem" data-action="popout">
              Pop out
            </button>
          </div>
        </div>

        <div className="dash-panel" id="panel-live" hidden>
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
        </div>
      </section>

      {/* Deadlines */}
      <section className="dash-item">
        <div
          className="dash-card"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          aria-controls="panel-deadlines"
        >
          <span className="icon">⏰</span>
          <span className="label">Next deadline &amp; reminders</span>

          <button
            className="menu-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="menu-deadlines"
          >
            ⋯
          </button>
          <svg className="chev" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>

          <div className="dropdown" id="menu-deadlines" role="menu" hidden>
            <button role="menuitem" data-action="add-reminder">
              Add reminder
            </button>
            <button role="menuitem" data-action="sync-calendar">
              Sync to calendar
            </button>
            <hr />
            <button role="menuitem" data-action="help-deadlines">
              Help
            </button>
          </div>
        </div>

        <div className="dash-panel" id="panel-deadlines" hidden>
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
        </div>
      </section>

      {/* Pick a plan */}
      <section className="dash-item">
        <div
          className="dash-card"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          aria-controls="panel-plan"
        >
          <span className="icon">🧭</span>
          <span className="label">
            Pick a plan (Solo 401(k), SEP IRA, Roth IRA)
          </span>

          {/* kebab trigger */}
          <button
            className="menu-trigger"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="menu-plan"
          >
            ⋯
          </button>

          {/* caret */}
          <svg
            className="chev"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>

          {/* dropdown menu */}
          <div className="dropdown" id="menu-plan" role="menu" hidden>
            <button role="menuitem" data-action="reset-plan">
              Reset selection
            </button>
            <button role="menuitem" data-action="help-plan">
              Help / Docs
            </button>
            <hr />
            <button role="menuitem" data-action="remove-card">
              Hide from dashboard
            </button>
          </div>
        </div>

        <div className="dash-panel" id="panel-plan" hidden>
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
        </div>
      </section>

      {/* Estimator */}
      <section className="dash-item">
        <div
          className="dash-card"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          aria-controls="panel-estimator"
        >
          <span className="icon">💸</span>
          <span className="label">Quarterly tax estimator</span>

          <button
            className="menu-trigger"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="menu-estimator"
          >
            ⋯
          </button>

          <svg className="chev" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>

          <div className="dropdown" id="menu-estimator" role="menu" hidden>
            <button role="menuitem" data-action="history">
              View history
            </button>
            <button role="menuitem" data-action="clear-estimator">
              Clear inputs
            </button>
            <hr />
            <button role="menuitem" data-action="help-estimator">
              Help
            </button>
          </div>
        </div>

        <div className="dash-panel" id="panel-estimator" hidden>
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
              Estimated net income{' '}
              <input type="number" placeholder="e.g., 24000" />
            </label>
            <label className="field">
              % set-aside <input type="number" placeholder="e.g., 30" />
            </label>
          </div>
          <div className="actions">
            <button>Estimate</button>
          </div>
        </div>
      </section>

      {/* Record a set-aside */}
      <section className="dash-item">
        <div
          className="dash-card"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          aria-controls="panel-record"
        >
          <span className="icon">📝</span>
          <span className="label">Record a set-aside</span>

          <button
            className="menu-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="menu-record"
          >
            ⋯
          </button>
          <svg className="chev" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>

          <div className="dropdown" id="menu-record" role="menu" hidden>
            <button role="menuitem" data-action="quick-100">
              Quick add $100
            </button>
            <button role="menuitem" data-action="quick-500">
              Quick add $500
            </button>
            <hr />
            <button role="menuitem" data-action="undo-last">
              Undo last
            </button>
          </div>
        </div>

        <div className="dash-panel" id="panel-record" hidden>
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
        </div>
      </section>

      {/* Contributions */}
      <section className="dash-item">
        <div
          className="dash-card"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          aria-controls="panel-contribs"
        >
          <span className="icon">📊</span>
          <span className="label">
            Your contributions (table: date, account, amount)
          </span>

          <button
            className="menu-trigger"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-controls="menu-contribs"
          >
            ⋯
          </button>
          <svg className="chev" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 10l5 5 5-5z" />
          </svg>

          <div className="dropdown" id="menu-contribs" role="menu" hidden>
            <button role="menuitem" data-action="export-csv">
              Export CSV
            </button>
            <button role="menuitem" data-action="export-pdf">
              Export PDF
            </button>
            <hr />
            <button role="menuitem" data-action="columns">
              Column preferences
            </button>
          </div>
        </div>

        <div className="dash-panel" id="panel-contribs" hidden>
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
        </div>
      </section>
    </main>
  );
}
