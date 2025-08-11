import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import useMutation from "../api/useMutation";
import mapboxgl from "mapbox-gl";

export default function CreateFind() {
  const navigate = useNavigate();
  const { mutate, error, loading } = useMutation("POST", "/finds", ["finds"]);

  //form data state
  const [formData, setFormData] = useState({
    species: "",
    date_found: "",
    description: "",
    latitude: "",
    longitude: "",
    location: "",
  });

  // --- Map state
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  }

  // Initialize small map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98, 39],
      zoom: 3,
    });

    // click to place / move marker
    mapRef.current.on("click", (e) => {
      const lng = Number(e.lngLat.lng.toFixed(6));
      const lat = Number(e.lngLat.lat.toFixed(6));
      placeMarker(lng, lat);
      setFormData((s) => ({
        ...s,
        longitude: String(lng),
        latitude: String(lat),
      }));
    });
  }, []);

  function placeMarker(lng, lat) {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      // dragging marker updates inputs
      markerRef.current.on("dragend", () => {
        const { lng, lat } = markerRef.current.getLngLat();
        const L = Number(lat.toFixed(6));
        const G = Number(lng.toFixed(6));
        setFormData((s) => ({
          ...s,
          longitude: String(G),
          latitude: String(L),
        }));
      });
    }
    mapRef.current.flyTo({ center: [lng, lat], zoom: 10 });
  }

  // Use browser geolocation
  async function useMyLocation() {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        placeMarker(lng, lat);
        setFormData((s) => ({
          ...s,
          latitude: String(lat),
          longitude: String(lng),
        }));

        // Optional: reverse geocode for a friendly label
        try {
          const label = await reverseGeocode(lng, lat);
          if (label) setFormData((s) => ({ ...s, location: label }));
        } catch {}
      },
      (err) => {
        console.error(err);
        alert("Could not get your location. You can click on the map instead.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  // Mapbox reverse geocoding (optional)
  async function reverseGeocode(lng, lat) {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.features?.[0]?.place_name ?? null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      species: formData.species,
      date_found: formData.date_found, // must be YYYY-MM-DD
      description: formData.description || null,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      location: formData.location || null, // optional label
    };
    const success = await mutate(payload);
    if (success) navigate("/my-finds");
  }

  return (
    <>
      <h1>Log a New Mushroom Find</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Species:
          <input
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Date Found:
          <input
            type="date"
            name="date_found"
            value={formData.date_found}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        {/* Location inputs (optional) */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <label>
            Latitude (optional):
            <input
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Click map or use My Location"
            />
          </label>
          <label>
            Longitude (optional):
            <input
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Click map or use My Location"
            />
          </label>
        </div>

        <div style={{ margin: "8px 0" }}>
          <button type="button" onClick={useMyLocation}>
            Use my location
          </button>
        </div>

        {/* Small map picker */}
        <div
          ref={mapContainerRef}
          style={{
            height: 260,
            border: "1px solid #ccc",
            borderRadius: 8,
            marginBottom: 12,
          }}
        />

        <label>
          Location label (optional):
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Eugene, OR trailhead"
          />
        </label>

        <button disabled={loading}>Create Find</button>
        {error && <output style={{ color: "red" }}>{error}</output>}
      </form>
    </>
  );
}
