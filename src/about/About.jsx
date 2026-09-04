import React from 'react';
import { DogFact } from './DogFact';

// Named export for the router/imports
export function About() {
  return (
    <main>
      <p>
        SidePot is a planner for self-employed people. Paychecks without an employer don&apos;t withhold taxes or fund
        retirement automatically, so SidePot helps you estimate how much of each month&apos;s income to set aside for
        taxes, compare Solo 401(k), SEP IRA, and Roth IRA contribution limits, and record what you actually put away. A
        small anonymized live feed shows other people saving too, to keep you motivated.
      </p>

      <p>
        SidePot is an educational demo built for a web programming course. It is <strong>not</strong> tax or investment
        advice — always confirm real numbers with a professional.
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
