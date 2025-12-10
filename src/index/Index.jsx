import React from 'react';
import './index.css';

export function Index() {
  return (
    <>
      <form>
        <h1>
          Welcome to SidePot<sup>&reg;</sup>
        </h1>
        
        <div>
          <span>@</span>
          <input type="text" placeholder="your@email.com" />
        </div>
        <div>
          <span>🔒</span>
          <input type="password" placeholder="password" />
        </div>
        <button type="submit">Login</button>
        <button type="button">Create</button>
      </form>
       <h1>
          <sup></sup>
        </h1>
      <section id="platform-overview">
        <div className="card">
          What you can do: Pick Solo 401(k)/SEP IRA/Roth IRA, estimate taxes, track set-asides
        </div>
        <div className="card">
          Live savings ticker (WebSocket): &apos;Someone just set aside $250 for Q3 taxes&apos;
        </div>
      </section>
    </>
  );
}
