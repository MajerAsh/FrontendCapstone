import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import useQuery from "../api/useQuery";
import { useAuth } from "../auth/AuthContext";
import "../styles/theme.css";
import "../styles/welcome.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Welcome() {
  // map refs
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  // filters (restored)
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState(""); // YYYY-MM-DD

  const { data: finds } = useQuery("/finds", "all-finds");
  const { token } = useAuth();

  // absolute image URL helper (unchanged)
  const imgSrc = (pathOrUrl) => {
    if (!pathOrUrl) return null;
    return pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `${import.meta.env.VITE_API_URL}${pathOrUrl}`;
  };

  // init map once
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98, 39],
      zoom: 3,
    });
  }, []);

  // date helper (restored)
  function isWithinDateRange(dateStr, from, to) {
    if (!dateStr) return false;
    const d = new Date(dateStr + "T00:00:00");
    if (from) {
      const f = new Date(from + "T00:00:00");
      if (d < f) return false;
    }
    if (to) {
      const t = new Date(to + "T23:59:59");
      if (d > t) return false;
    }
    return true;
  }

  // add markers whenever finds or filters change (restored logic)
  useEffect(() => {
    if (!map.current || !finds) return;

    // clear old markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let added = 0;

    const makeMushroomEl = () => {
      const el = document.createElement("div");
      el.className = "marker-mushroom";
      el.innerHTML = `<img src="/svgs/mushroom.svg" alt="mushroom marker" />`;
      return el;
    };

    finds
      .filter((find) => {
        const speciesMatch =
          speciesFilter === "" ||
          (find.species || "")
            .toLowerCase()
            .includes(speciesFilter.toLowerCase());

        const dateMatch =
          (!fromDate && !toDate) ||
          isWithinDateRange(find.date_found, fromDate, toDate);

        return speciesMatch && dateMatch;
      })
      .forEach((find) => {
        if (find.longitude == null || find.latitude == null) return;

        const label = (find.location || "").trim();
        const coords =
          find.latitude != null && find.longitude != null
            ? `(${Number(find.latitude).toFixed(5)}, ${Number(
                find.longitude
              ).toFixed(5)})`
            : "";

        const popupContent = `
          <strong>${find.species ?? "Unknown"}</strong><br/>
          ${find.date_found ?? ""}<br/>
          ${label || coords ? `${label || coords}<br/>` : ""}
          ${
            find.image_url
              ? `<div style="margin:8px 0">
                  <img
                    src="${imgSrc(find.image_url)}"
                    alt="${(find.species ?? "Mushroom").replace(
                      /"/g,
                      "&quot;"
                    )} photo"
                    style="max-width:80%;height:auto;border-radius:8px"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                 </div>`
              : ""
          }
          ${
            token
              ? `<a href="/user/${find.username}/finds">${find.username}</a>`
              : ""
          }
        `;

        //v custom map marker v
        const marker = new mapboxgl.Marker({
          element: makeMushroomEl(),
          anchor: "bottom", // tip sits on coords
          offset: [0, 4], // tiny nudge
        })

          .setLngLat([find.longitude, find.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(map.current);

        markers.current.push(marker);
        bounds.extend([find.longitude, find.latitude]);
        added += 1;
      });

    if (added > 0) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 6, duration: 800 });
    }
  }, [finds, speciesFilter, fromDate, toDate, token]);

  // UI (styled, no inline layout)
  return (
    <section className="welcome container forest-rays  corner-sticker corner-sticker--mushroom">
      <h1>Welcome to MycoMap</h1>

      {/* Filters */}
      <div className="grid">
        <label className="filter">
          Species (text):
          <input
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            placeholder="e.g. chanterelle"
          />
        </label>

        <div className="grid grid-sm-2">
          <label className="filter">
            From date:
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>

          <label className="filter">
            To date:
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setSpeciesFilter("");
              setFromDate("");
              setToDate("");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div ref={mapContainer} className="map-wrap" />
    </section>
  );
}
