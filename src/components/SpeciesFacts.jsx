// component or use existing usequery inline
import { useEffect, useState } from "react";
import { useApi } from "../api/ApiContext";

/**
 * Renders a small safety badge + expandable fact sheet
 * for the given species name.
 *
 * Uses your backend endpoint: GET /mushrooms/facts?q=<name>
 * (which normalizes synonyms and returns SPECIES_META + optional enrichment)
 */
export default function SpeciesFacts({ name }) {
  const { request } = useApi();
  const [facts, setFacts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let canceled = false;
    async function go() {
      if (!name || !name.trim()) {
        setFacts(null);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const q = `/mushrooms/facts?q=${encodeURIComponent(name.trim())}`;
        const data = await request(q);
        if (!canceled) setFacts(data);
      } catch (e) {
        if (!canceled) setErr(e.message);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    go();
    return () => {
      canceled = true;
    };
  }, [name, request]);

  if (!name || !name.trim()) return null;

  // tiny badge logic
  const badge = facts?.deadly ? "DEADLY" : facts?.edible ? "EDIBLE" : "UNKNOWN";
  const badgeStyle = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.6,
    background: facts?.deadly ? "#ffe5e5" : facts?.edible ? "#e8f7e8" : "#eee",
    color: facts?.deadly ? "#b00020" : facts?.edible ? "#0b6b0b" : "#555",
    border: "1px solid rgba(0,0,0,0.08)",
    marginTop: 4,
  };

  return (
    <div style={{ marginTop: 6 }}>
      <span style={badgeStyle}>{loading ? "Checking..." : badge}</span>
      {err ? (
        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>{err}</div>
      ) : null}

      {facts ? (
        <details style={{ marginTop: 6 }}>
          <summary style={{ cursor: "pointer", fontSize: 13 }}>
            Fact sheet
          </summary>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            <div>
              <strong>Scientific:</strong> {facts.scientific_name}
            </div>
            {facts.notes && (
              <div style={{ marginTop: 4 }}>
                <strong>Notes:</strong> {facts.notes}
              </div>
            )}
            {Array.isArray(facts.deadly_lookalikes) &&
              facts.deadly_lookalikes.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <strong>Deadly look‑alikes:</strong>{" "}
                  {facts.deadly_lookalikes.join(", ")}
                </div>
              )}
            {Array.isArray(facts.toxins) && facts.toxins.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <strong>Toxins:</strong> {facts.toxins.join(", ")}
              </div>
            )}
            {facts.syndrome && (
              <div style={{ marginTop: 4 }}>
                <strong>Syndrome:</strong> {facts.syndrome}
              </div>
            )}
          </div>
        </details>
      ) : null}
    </div>
  );
}
