import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import useMutation from "../api/useMutation";
import mapboxgl from "mapbox-gl";

import "../styles/theme.css";
import "../styles/forms.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; //mapbox token

export default function CreateFind() {
  const navigate = useNavigate();
  const { mutate, error, loading } = useMutation("POST", "/finds", [
    "my-finds",
  ]);

  //form state
  const [formData, setFormData] = useState({
    species: "",
    date_found: "",
    description: "",
    latitude: "",
    longitude: "",
    location: "",
    hide_location: false,
  });

  const [file, setFile] = useState(null); //photo file

  //map state
  const mapRef = useRef(null); //map instance
  const mapContainerRef = useRef(null); //div for map
  const markerRef = useRef(null); //current marker

  //input handlers
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFile(e) {
    setFile(e.target.files?.[0] || null);
  }

  //init small map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98, 39], //USA
      zoom: 3,
    });

    //click to place/move marker
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

  //place marker + fly
  function placeMarker(lng, lat) {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      //dragging marker updates inputs
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

  //browser geolocation
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
        //optional reverse geocode to label
        try {
          const label = await reverseGeocode(lng, lat);
          if (label) setFormData((s) => ({ ...s, location: label }));
        } catch {
          error;
        }
      },
      (err) => {
        console.error(err);
        alert("Could not get your location. You can click on the map instead.");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  //mapbox reverse geocoding
  async function reverseGeocode(lng, lat) {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.features?.[0]?.place_name ?? null;
  }

  //submit as FormData so multer can parse photo + fields
  async function handleSubmit(e) {
    e.preventDefault();

    const fd = new FormData();
    fd.append("species", formData.species);
    fd.append("date_found", formData.date_found); //YYYY-MM-DD
    if (formData.description) fd.append("description", formData.description);
    if (formData.latitude) fd.append("latitude", formData.latitude);
    if (formData.longitude) fd.append("longitude", formData.longitude);
    if (formData.location) fd.append("location", formData.location);
    if (file) fd.append("photo", file); //must match upload.single("photo") on backend
    fd.append("hide_location", formData.hide_location ? "true" : "false");

    const success = await mutate(fd); //useMutation passes isFormData to request()
    if (success) navigate("/my-finds");
  }

  return (
    <div className="form-screen">
      <h1 className="form-title" id="create-find-title">
        Log a New Mushroom Find
      </h1>
      <form
        onSubmit={handleSubmit}
        aria-label="Log a new mushroom find"
        role="form"
        aria-labelledby="create-find-title"
      >
        <label htmlFor="create-species">Species:</label>
        <input
          id="create-species"
          name="species"
          value={formData.species}
          onChange={handleChange}
          required
          aria-required="true"
        />

        <label htmlFor="create-date">Date Found:</label>
        <input
          id="create-date"
          type="date"
          name="date_found"
          value={formData.date_found}
          onChange={handleChange}
          required
          aria-required="true"
        />

        <label htmlFor="create-description">Description:</label>
        <textarea
          id="create-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <div className="two-col">
          <label htmlFor="create-latitude">Latitude (optional):</label>
          <input
            id="create-latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Click map or use My Location"
          />
          <label htmlFor="create-longitude">Longitude (optional):</label>
          <input
            id="create-longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Click map or use My Location"
          />
        </div>

        <div className="helper">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={useMyLocation}
            aria-label="Use my current location"
          >
            Use my location
          </button>
        </div>

        <div
          ref={mapContainerRef}
          className="mini-map"
          aria-label="Map to set coordinates"
          tabIndex={0}
          role="region"
        />

        <label htmlFor="create-location">Location label (optional):</label>
        <input
          id="create-location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Eugene, OR trailhead"
        />

        <label htmlFor="create-photo">Photo (optional):</label>
        <input
          id="create-photo"
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleFile}
        />
        <div className="checkbox-row">
          <label htmlFor="create-hide-location">
            <input
              id="create-hide-location"
              type="checkbox"
              name="hide_location"
              checked={formData.hide_location}
              onChange={handleChange}
            />
            Keep location secret
          </label>
        </div>
        <button
          className="btn btn--primary"
          disabled={loading}
          aria-busy={loading}
        >
          Create Find
        </button>
        {error && (
          <output className="error" aria-live="assertive" role="alert">
            {error}
          </output>
        )}
      </form>
    </div>
  );
}
