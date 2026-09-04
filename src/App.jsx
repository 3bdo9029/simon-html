import React, { useEffect, useState } from 'react';
import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

import { About } from './about/About.jsx';
import { Contributions } from './contributions/Contributions.jsx';
import { Dashboard } from './dashboard/Dashboard.jsx';
import { Index } from './index/Index.jsx';
import { Planner } from './planner/Planner.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if already authenticated when the app loads
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const body = await res.json();
          if (body.authenticated) {
            setCurrentUser(body.username);
          }
        }
      } catch (err) {
        console.error('Error calling /api/auth/me', err);
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuth();
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error during logout', err);
    }
    setCurrentUser(null);
  }

  if (!authChecked) {
    // Simple loading state while we check cookies/session
    return (
      <div className="body bg-dark text-light d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between p-3">
          <div>
            <h1 className="m-0">
              SidePot<sup>&reg;</sup>
            </h1>
          </div>

          <nav className="mt-3 mt-md-0">
            <menu className="d-flex gap-3 list-unstyled m-0">
              <li>
                <NavLink to="/" end>Home</NavLink>
              </li>
              <li>
                <NavLink to="/Dashboard">Dashboard</NavLink>
              </li>
              <li>
                <NavLink to="/Planner">Planner</NavLink>
              </li>
              <li>
                <NavLink to="/Contributions">Contributions</NavLink>
              </li>
              <li>
                <NavLink to="/About">About</NavLink>
              </li>
            </menu>
          </nav>

          <div className="mt-3 mt-md-0">
            {currentUser ? (
              <>
                <span className="me-2">Hi, {currentUser}</span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <span className="text-muted">Not logged in</span>
            )}
          </div>
        </header>

        <hr className="mt-0" />

        <main className="p-3">
          <Routes>
            <Route path="/" element={<Index currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Planner" element={<Planner currentUser={currentUser} />} />
            <Route path="/Contributions" element={<Contributions />} />
            <Route path="/About" element={<About />} />
          </Routes>
        </main>

        <footer className="p-3 text-center">
          <img src="placeholder.jpg" alt="Parrot placeholder" width="300" />
          <hr />
          <span className="text-reset">By the pen of Abe Farghali</span>
          <br />
          <a href="https://github.com/3bdo9029/SidePot">GitHub</a>
        </footer>
      </div>
    </BrowserRouter>
  );
}
