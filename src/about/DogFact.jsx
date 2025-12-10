import React, { useEffect, useState } from 'react';

export default function DogFact() {
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchFacts(count = 1) {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(
        `https://dog-facts-api.herokuapp.com/api/v1/resources/dogs?number=${count}`
      );

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json(); // data is an array of { fact: "..." }
      setFacts(data);
    } catch (err) {
      console.error(err);
      setError('Could not load dog facts. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // Load one fact when the component first renders
  useEffect(() => {
    fetchFacts(1);
  }, []);

  return (
    <div className="dog-fact">
      <h2>Random Dog Facts 🐶</h2>

      <button onClick={() => fetchFacts(1)} disabled={loading}>
        {loading ? 'Loading…' : 'Get another dog fact'}
      </button>

      <button onClick={() => fetchFacts(3)} disabled={loading} style={{ marginLeft: '0.5rem' }}>
        {loading ? 'Loading…' : 'Get 3 facts'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {facts.map((f, i) => (
          <li key={i}>{f.fact}</li>
        ))}
      </ul>
    </div>
  );
}
