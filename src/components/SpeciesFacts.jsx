// component or use existing usequery inline
import { useEffect, useState } from "react";
import { useApi } from "../api/ApiContext";

/**
 * Renders a small safety badge + expandable fact sheet
 * for the given species name.
 *
 * Uses backend endpoint: GET /mushrooms/facts?q=<name>
 * (which normalizes synonyms and returns SPECIES_META)
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

  return (
    <div className="sf" role="region" aria-label="Mushroom safety facts">
      <span
        className={
          facts?.deadly
            ? "badge badge--deadly"
            : facts?.edible
            ? "badge badge--edible"
            : "badge badge--unknown"
        }
        aria-live={loading ? "polite" : undefined}
        role="status"
        aria-label={
          loading
            ? "Checking safety status"
            : facts?.deadly
            ? "Deadly species"
            : facts?.edible
            ? "Edible species"
            : "Unknown edibility"
        }
        tabIndex={0}
      >
        {loading
          ? "Checking..."
          : facts?.deadly
          ? "DEADLY"
          : facts?.edible
          ? "EDIBLE"
          : "UNKNOWN"}
      </span>

      {err && (
        <output className="error" aria-live="assertive" role="alert">
          {err}
        </output>
      )}

      {facts && (
        <div className="factsheet" tabIndex={0} aria-label="Detailed factsheet">
          <dl>
            <dt>Scientific</dt>
            <dd>{facts.scientific_name}</dd>
            {facts.notes && (
              <>
                <dt>Notes</dt>
                <dd>{facts.notes}</dd>
              </>
            )}
            {!!facts.deadly_lookalikes?.length && (
              <>
                <dt>Deadly look-alikes</dt>
                <dd>{facts.deadly_lookalikes.join(", ")}</dd>
              </>
            )}
            {!!facts.toxins?.length && (
              <>
                <dt>Toxins</dt>
                <dd>{facts.toxins.join(", ")}</dd>
              </>
            )}
            {facts.syndrome && (
              <>
                <dt>Syndrome</dt>
                <dd>{facts.syndrome}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
