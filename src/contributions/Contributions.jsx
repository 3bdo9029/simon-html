import React, { useEffect, useState } from 'react';
import './contributions.css';

const STORAGE_KEY = 'sidepot-contributions';

// Seed rows used only when neither the API nor localStorage has data
const seedContributions = [
  { id: 1, date: '2026-08-15', type: 'Tax set-aside', amount: 400 },
  { id: 2, date: '2026-08-01', type: 'Solo 401(k)', amount: 250 },
  { id: 3, date: '2026-07-15', type: 'Roth IRA', amount: 150 },
];

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fall through to seed data
  }
  return seedContributions;
}

function saveLocal(contributions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contributions));
  } catch {
    // ignore
  }
}

export function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [type, setType] = useState('Tax set-aside');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Loading…');
  const [csvUrl, setCsvUrl] = useState(null);

  // Load from the service; until it is deployed, fall back to
  // localStorage (or seed data) so the list survives a refresh.
  useEffect(() => {
    async function loadContributions() {
      try {
        const res = await fetch('/api/contributions');
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        setContributions(Array.isArray(data) ? data : []);
        setStatus('');
      } catch {
        setContributions(loadLocal());
        setStatus('Showing locally saved data (service not deployed yet).');
      }
    }
    loadContributions();
  }, []);

  // Revoke the generated CSV object URL when it is replaced or on unmount
  useEffect(() => {
    return () => {
      if (csvUrl) URL.revokeObjectURL(csvUrl);
    };
  }, [csvUrl]);

  async function handleAdd(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      return;
    }

    const entry = {
      id: Date.now(),
      date: date || new Date().toISOString().slice(0, 10),
      type,
      amount: value,
    };

    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setStatus('Saved to the service.');
    } catch {
      setStatus('Saved locally (service not deployed yet).');
    }

    setContributions((prev) => {
      const next = [entry, ...prev];
      saveLocal(next);
      return next;
    });
    setAmount('');
    setDate('');
    setCsvUrl(null); // stale export
  }

  function handleGenerateCsv() {
    const header = 'date,type,amount';
    const rows = contributions.map((c) => `${c.date},${c.type},${c.amount}`);
    const csv = [header, ...rows].join('\n');
    setCsvUrl(URL.createObjectURL(new Blob([csv], { type: 'text/csv' })));
  }

  return (
    <main className="contributions-main">
      <h2>Contributions &amp; Live Feed</h2>

      <section className="card">
        <h3>Recorded contributions</h3>
        <table className="contrib-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => (
              <tr key={c.id}>
                <td>{c.date}</td>
                <td>{c.type}</td>
                <td>${c.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions" style={{ marginTop: '12px' }}>
          <button onClick={handleGenerateCsv}>Generate CSV</button>
          {csvUrl && (
            <a href={csvUrl} download="contributions.csv">
              Download contributions.csv
            </a>
          )}
        </div>
        {status && <p className="status-message">{status}</p>}
      </section>

      <section className="card">
        <h3>Add contribution</h3>
        <form className="contrib-form" onSubmit={handleAdd}>
          <label htmlFor="ctype">Type</label>
          <select id="ctype" value={type} onChange={(e) => setType(e.target.value)}>
            <option>Tax set-aside</option>
            <option>Solo 401(k)</option>
            <option>SEP IRA</option>
            <option>Roth IRA</option>
          </select>

          <label htmlFor="camount">Amount</label>
          <input
            id="camount"
            type="number"
            min="1"
            placeholder="250"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label htmlFor="cdate">Date</label>
          <input id="cdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

          <button type="submit">Record</button>
        </form>
      </section>

      {/* WebSocket placeholder: anonymized live events will stream here */}
      <section className="card contrib-feed">
        <h3>Live feed (WebSocket)</h3>
        <p>📡 Someone just set aside $50 for retirement</p>
        <p>📡 Average set-aside today: $120</p>
      </section>
    </main>
  );
}
