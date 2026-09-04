import React, { useEffect, useState } from 'react';
import './contributions.css';

export function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [type, setType] = useState('Tax set-aside');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Loading…');
  const [csvUrl, setCsvUrl] = useState(null);

  // The database is the single source of truth for contributions
  useEffect(() => {
    async function loadContributions() {
      try {
        const res = await fetch('/api/contributions');
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        setContributions(Array.isArray(data) ? data : []);
        setStatus('');
      } catch (err) {
        console.error('Failed to load contributions', err);
        setStatus('Could not load contributions.');
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

    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date || new Date().toISOString().slice(0, 10),
          type,
          amount: value,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);

      const created = await res.json();
      setContributions((prev) => [created, ...prev]);
      setAmount('');
      setDate('');
      setCsvUrl(null); // stale export
      setStatus('Saved.');
    } catch (err) {
      console.error('Failed to save contribution', err);
      setStatus('Could not save contribution.');
    }
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
