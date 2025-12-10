import React from 'react';
import './contributions.css';

export function Contributions() {
  return (
    <main>
      <h2>Contributions & Live Feed</h2>
      <div className="card">Contributions table (DB): date, type (tax/401k/IRA), amount</div>
      <div className="card">Add contribution form</div>
      <div className="card">Live feed (WebSocket): anonymized events, average set-aside today, simple chart</div>
      <div className="card">Export CSV button</div>
    </main>
  );
}