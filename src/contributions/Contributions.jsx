import React from 'react';
import './contributions.css';

export function Contributions() {
  return (
    <main>
      <h2>Contributions & Live Feed</h2>
      <div class="card">Contributions table (DB): date, type (tax/401k/IRA), amount</div>
      <div class="card">Add contribution form</div>
      <div class="card">Live feed (WebSocket): anonymized events, average set-aside today, simple chart</div>
      <div class="card">Export CSV button</div>
    </main>
  );
}