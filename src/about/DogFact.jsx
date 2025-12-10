// src/about/DogFact.jsx
import React, { useEffect, useState } from "react";

export function DogFact() {
  const [fact, setFact] = useState("Loading a dog fact...");

  useEffect(() => {
    async function fetchFact() {
      try {
        const response = await fetch("https://dogapi.dog/api/v2/facts");
        const data = await response.json();
        const text = data?.data?.[0]?.attributes?.body || "Dogs are awesome.";
        setFact(text);
      } catch (err) {
        console.error(err);
        setFact("Could not load a dog fact right now.");
      }
    }

    fetchFact();
  }, []);

  return (
    <section className="dog-fact card p-3 mt-3">
      <h2>Random Dog Fact</h2>
      <p>{fact}</p>
    </section>
  );
}
