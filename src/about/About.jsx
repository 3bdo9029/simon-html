import React from 'react';
import './about.css';
import { DogFact } from './DogFact';

// Named export for the router/imports
export function About() {
  return (
    <main>
      <p>
        Simon is a repetitive memory game where you follow the demonstrated color sequence until you make a mistake. The
        longer the sequence you repeat, the greater your score.
      </p>

      <p>
        The name Simon is a registered trademark of Milton-Bradley. Our use of the name and the game is for non-profit
        educational use only. No part of this code or program should be used outside of that definition.
      </p>

      <div id="quote">
        <div>Words are cheap. Show me the code.</div>
        <div>- Linus Torvalds</div>
      </div>

      <div className="body bg-dark text-light">
        {/* other sections / cards */}
        <DogFact />
      </div>
    </main>
  );
}

