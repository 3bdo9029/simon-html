import React from 'react';
import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';

import { About } from './about/About.jsx';
import { Contributions } from './contributions/Contributions.jsx';
import { Dashboard } from './dashboard/Dashboard.jsx';
import { Index } from './index/Index.jsx';
import { Planner } from './planner/Planner.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header>
          <h1>
            SidePot<sup>&reg;</sup>
          </h1>

          <nav>
            <menu>
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

          <hr />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Planner" element={<Planner />} />
            <Route path="/Contributions" element={<Contributions />} />
            <Route path="/About" element={<About />} />
          </Routes>
        </main>

        <footer>
          <img src="placeholder.jpg" alt="Parrot placeholder" width="300" />
          <hr />
          <span className="text-reset">By the pen of Abe Farghali</span>
          <br />
          <a href="https://github.com/3bdo9029/simon-html/">GitHub</a>
        </footer>
      </div>
    </BrowserRouter>
  );
}
