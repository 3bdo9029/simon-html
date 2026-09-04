import React, { useEffect, useState } from "react";

export function DogFact() {
  const [fact, setFact] = useState("Loading a dog fact...");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFact() {
      try {
        // Our Express backend proxies the third-party dogapi.dog service
        const response = await fetch("/api/dogfact", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Dog fact request failed with status ${response.status}`);
        }
        const data = await response.json();
        setFact(data?.fact || "Dogs are awesome.");
      } catch (err) {
        if (err.name === "AbortError") {
          return; // component unmounted — don't touch state
        }
        console.error(err);
        setFact("Could not load a dog fact right now.");
      }
    }

    fetchFact();

    // Abort the in-flight request if the component unmounts
    return () => controller.abort();
  }, []);

  return (
    <section className="dog-fact card p-3 mt-3">
      <h2>Random Dog Fact</h2>
      <p>{fact}</p>
    </section>
  );
}
