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

  // filters
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState(""); // YYYY-MM-DD

  const { data: finds } = useQuery("/finds", "all-finds");
  const { token } = useAuth();

  // absolute image URL helper 
  const imgSrc = (pathOrUrl) => {
    if (!pathOrUrl) return null;
    return pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `${import.meta.env.VITE_API_URL}${pathOrUrl}`;
  };

  // initiate map once
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98, 39],
      zoom: 3,
    });
  }, []);

  // date helper
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
        const imageHTML = find.image_url
          ? `<img
        src="${imgSrc(find.image_url)}"
        alt="${(find.species ?? "Mushroom").replace(/"/g, "&quot;")} photo"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.src='/svgs/sadmushroom.png'"
     />`
          : "";
        const popupContent = `
          <h3>${find.species ?? "Unknown"}</h3>
          ${imageHTML}
                ${find.date_found ?? ""}<br/>
          ${label || coords ? `${label || coords}<br/>` : ""}
          ${
            token
              ? `<a href="/user/${find.username}/finds">${find.username}</a>`
              : ""
          }
 `;
        // anchor based on where the marker is on screen
        const pt = map.current.project([find.longitude, find.latitude]);
        const { width, height } = map.current
          .getContainer()
          .getBoundingClientRect();
        let anchor = "bottom";
        if (pt.y < height * 0.33) anchor = "top";
        if (pt.x < width * 0.33) anchor += "-right";
        else if (pt.x > width * 0.66) anchor += "-left";

        //compact popup
        const popup = new mapboxgl.Popup({
          anchor,
          autoPan: true,
          maxWidth: "165px",
          maxHeight: "160px",
          offset: {
            top: [0, 12],
            "top-left": [8, 12],
            "top-right": [-8, 12],
            bottom: [0, -4],
            "bottom-left": [8, -4],
            "bottom-right": [-8, -4],
            left: [12, 0],
            right: [-12, 0],
          },
          closeButton: false,
        }).setHTML(popupContent);

        //v custom map marker v
        const marker = new mapboxgl.Marker({
          element: makeMushroomEl(),
          anchor: "bottom",
          offset: [0, 4], // tip sits on coords
        })

          .setLngLat([find.longitude, find.latitude])
          .setPopup(popup)
          .addTo(map.current);

        markers.current.push(marker);
        bounds.extend([find.longitude, find.latitude]);
        added += 1;
      });

    if (added > 0) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 6, duration: 800 });
    }
  }, [finds, speciesFilter, fromDate, toDate, token]);

  return (
    <section
      className="welcome container forest-rays corner-sticker corner-sticker--gnome"
      role="main"
      aria-labelledby="welcome-title"
    >
      <h1 id="welcome-title">Welcome to Myco Map</h1>

      {/* Filters */}

      <form
        className="grid"
        aria-label="Filter mushroom finds"
        onSubmit={(e) => e.preventDefault()}
        role="search"
      >
        <label className="filter" htmlFor="species-filter">
          Species (text):
        </label>
        <input
          id="species-filter"
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          placeholder="e.g. chanterelle"
          aria-label="Species filter"
        />

        <div className="filter-group">
          <label className="filter" htmlFor="from-date">
            From date:
          </label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="From date"
          />
          <label className="filter" htmlFor="to-date">
            To date:
          </label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="To date"
          />
        </div>

        <div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setSpeciesFilter("");
              setFromDate("");
              setToDate("");
            }}
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>
      </form>

      <div
        ref={mapContainer}
        className="map-wrap"
        aria-label="Map of mushroom finds"
        tabIndex={0}
        role="region"
      />
    </section>
  );
}
