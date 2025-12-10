import React, { useEffect, useState } from 'react';
import './planner.css';

export function Planner({ currentUser }) {
  const [items, setItems] = useState([]);
  const [newText, setNewText] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlanner() {
      try {
        const res = await fetch('/api/planner');

        if (res.status === 401) {
          setStatus('Log in to use your planner.');
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error('Failed to load planner');

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setStatus('Could not load planner.');
      } finally {
        setLoading(false);
      }
    }

    loadPlanner();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;

    setStatus('');

    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      if (res.status === 401) {
        setStatus('Your session expired. Please log in again.');
        return;
      }

      if (!res.ok) throw new Error('Failed to save item');

      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setNewText('');
      setStatus('Item saved.');
    } catch (err) {
      console.error(err);
      setStatus('Could not save item.');
    }
  }

  return (
    <main className="planner-main">
      <header className="planner-header">
        <h1>SidePot planner</h1>
        {currentUser && (
          <p className="planner-subtitle">
            Signed in as <strong>{currentUser}</strong>
          </p>
        )}
      </header>

      <section className="planner-form-section">
        <form onSubmit={handleAdd} className="planner-form">
          <label htmlFor="planner-text" className="planner-label">
            New planner item
          </label>
          <div className="planner-input-row">
            <input
              id="planner-text"
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Example: Set aside $600 for Q3 estimated taxes"
            />
            <button type="submit">Add</button>
          </div>
        </form>
        {status && <div className="planner-status">{status}</div>}
      </section>

      <section className="planner-list-section">
        <h2>Your items</h2>

        {loading && <p>Loading planner…</p>}

        {!loading && items.length === 0 && (
          <p className="planner-empty">
            Nothing here yet. Add your first item above.
          </p>
        )}

        <ul className="planner-list">
          {items.map((item) => (
            <li key={item.id} className="planner-item">
              <div className="planner-item-text">{item.text}</div>
              <div className="planner-item-meta">
                <span>
                  Created:{' '}
                  {item.created
                    ? new Date(item.created).toLocaleString()
                    : 'just now'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
