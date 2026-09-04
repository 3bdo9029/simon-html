// src/index/Index.jsx
import React, { useState } from 'react';
import './index.css';

export function Index({ currentUser, setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  // Mocked login until the service milestone: succeed locally when the
  // auth API is not deployed yet, and remember the session in localStorage.
  function mockLogin() {
    setCurrentUser(email);
    try {
      localStorage.setItem('sidepot-user', email);
    } catch {
      // ignore
    }
    setMsg('Logged in (mocked until the service is deployed).');
    setPassword('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setCurrentUser(email);
        try {
          localStorage.setItem('sidepot-user', email);
        } catch {
          // ignore
        }
        setMsg(body.msg || 'Logged in.');
        setPassword('');
      } else if (res.status === 404 || res.status === 502) {
        // Auth service not deployed yet
        mockLogin();
      } else {
        setMsg(body.msg || 'Login failed.');
      }
    } catch (err) {
      console.error('Error logging in', err);
      mockLogin();
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        setMsg(body.msg || 'Account created. You can now log in.');
      } else if (res.status === 404 || res.status === 502) {
        mockLogin();
      } else {
        setMsg(body.msg || 'Error creating account.');
      }
    } catch (err) {
      console.error('Error creating account', err);
      mockLogin();
    }
  }

  return (
    <>
      <form
        onSubmit={handleLogin}
        className="index-form"
      >
        <h1>
          Welcome to SidePot<sup>&reg;</sup>
        </h1>

        {currentUser && (
          <p className="logged-in-banner">
            You are logged in as <strong>{currentUser}</strong>.
          </p>
        )}

        <div className="input-row">
          <span>@</span>
          <input
            type="text"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-row">
          <span>🔒</span>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="button-row">
          {/* Login uses form submit */}
          <button type="submit">Login</button>

          {/* Create triggers registration separately */}
          <button type="button" onClick={handleCreate}>
            Create
          </button>
        </div>

        {msg && <p className="status-message">{msg}</p>}
      </form>

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
