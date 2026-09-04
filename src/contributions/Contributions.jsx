import React, { useState } from 'react';
import './contributions.css';

// Seed rows stand in for data that will come from GET /api/contributions
const initialContributions = [
  { id: 1, date: '2026-08-15', type: 'Tax set-aside', amount: 400 },
  { id: 2, date: '2026-08-01', type: 'Solo 401(k)', amount: 250 },
  { id: 3, date: '2026-07-15', type: 'Roth IRA', amount: 150 },
];

export function Contributions() {
  const [contributions, setContributions] = useState(initialContributions);
  const [type, setType] = useState('Tax set-aside');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  function handleAdd(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      return;
    }
    setContributions((prev) => [
      {
        id: Date.now(),
        date: date || new Date().toISOString().slice(0, 10),
        type,
        amount: value,
      },
      ...prev,
    ]);
    setAmount('');
    setDate('');
  }

  function handleExportCsv() {
    const header = 'date,type,amount';
    const rows = contributions.map((c) => `${c.date},${c.type},${c.amount}`);
    const csv = [header, ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contributions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="contributions-main">
      <h2>Contributions &amp; Live Feed</h2>

      {/* Database placeholder: rows will come from GET /api/contributions */}
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
          <button onClick={handleExportCsv}>Export CSV</button>
        </div>
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
