import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import useQuery from "../api/useQuery";
import useMutation from "../api/useMutation";
import mapboxgl from "mapbox-gl";
import "../styles/theme.css";
import "../styles/forms.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function EditFind() {
  const { id } = useParams(); //grab :id from URL (which find to edit)
  const navigate = useNavigate();

  // PUT set up for mutation/edit a Find
  //the url is passed the overide path at cal time
  const { data: find, loading, error } = useQuery(`/finds/${id}`, `find-${id}`);
  const {
    mutate,
    loading: saving,
    error: saveError,
  } = useMutation("PUT", null, [`find-${id}`, "my-finds", "all-finds"]); //tags to invalidate so lists refresh

  //local form state
  const [formData, setFormData] = useState({
    species: "",
    date_found: "",
    description: "",
    latitude: "",
    longitude: "",
    location: "",
    image_url: "",
    hide_location: false,
  });
  const [file, setFile] = useState(null);

  //maps
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  //fill form once Find loads
  useEffect(() => {
    if (find) {
      setFormData({
        species: find.species || "",
        date_found: find.date_found || "",
        description: find.description || "",
        latitude: find.latitude ?? "",
        longitude: find.longitude ?? "",
        location: find.location || "",
        image_url: find.image_url || "",
        hide_location: !!find.hide_location,
      });
    }
  }, [find]);

  // init map 1x
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98, 39],
      zoom: 3,
    });
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

  //center on existing coords when available
  useEffect(() => {
    if (!find || !mapRef.current) return;
    if (find.longitude != null && find.latitude != null) {
      placeMarker(find.longitude, find.latitude);
      mapRef.current.flyTo({
        center: [find.longitude, find.latitude],
        zoom: 10,
      });
    }
  }, [find]);

  //helper: create/move a draggable marker + keep inputs in sync on drag
  function placeMarker(lng, lat) {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      //on drag end, copy coords into form state
      markerRef.current = new mapboxgl.Marker({
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      markerRef.current.on("dragend", () => {
        const { lng, lat } = markerRef.current.getLngLat();
        setFormData((s) => ({
          ...s,
          longitude: String(Number(lng.toFixed(6))),
          latitude: String(Number(lat.toFixed(6))),
        }));
      });
    }
  }

  //controlled inputs
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  //file input
  function handleFile(e) {
    setFile(e.target.files?.[0] || null);
  }

  //send PUT with override path:
  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("species", formData.species);
    fd.append("date_found", formData.date_found);
    if (formData.description) fd.append("description", formData.description);
    if (formData.latitude !== "") fd.append("latitude", formData.latitude);
    if (formData.longitude !== "") fd.append("longitude", formData.longitude);
    //if (formData.location) fd.append("location", formData.location);
    fd.append("location", formData.location ?? "");
    if (file) fd.append("photo", file);
    fd.append("hide_location", formData.hide_location ? "true" : "false");

    const ok = await mutate(fd, `/finds/${id}`); //overridePath to the right endpoint
    if (ok) navigate("/my-finds"); //go back to list
  }

  /* if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!find) return <p>Not found.</p>; //404 case*/

  return (
    <div className="form-screen">
      <div className="form-card" role="main" aria-labelledby="edit-find-title">
        <h1 className="form-title" id="edit-find-title">
          Edit Find
        </h1>
        {loading && <p aria-live="polite">Loading…</p>}
        {error && (
          <output className="error" aria-live="assertive" role="alert">
            {error}
          </output>
        )}
        {!loading && !find && <p>Not found.</p>}

        <form onSubmit={handleSubmit} aria-label="Edit mushroom find">
          <label htmlFor="edit-species">Species:</label>
          <input
            id="edit-species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            required
            aria-required="true"
          />

          <label htmlFor="edit-date">Date Found:</label>
          <input
            id="edit-date"
            type="date"
            name="date_found"
            value={formData.date_found}
            onChange={handleChange}
            required
            aria-required="true"
          />

          <label htmlFor="edit-description">Description:</label>
          <textarea
            id="edit-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="two-col">
            <label htmlFor="edit-latitude">Latitude:</label>
            <input
              id="edit-latitude"
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Click map to set"
            />
            <label htmlFor="edit-longitude">Longitude:</label>
            <input
              id="edit-longitude"
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Click map to set"
            />
          </div>

          <div
            ref={mapContainerRef}
            className="mini-map"
            aria-label="Map to set coordinates"
            tabIndex={0}
            role="region"
          />

          <label htmlFor="edit-location">Location label (optional):</label>
          <input
            id="edit-location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />

          <label htmlFor="edit-photo">Replace photo (optional):</label>
          <input
            id="edit-photo"
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFile}
          />
          <label className="checkbox-row" htmlFor="edit-hide-location">
            <input
              id="edit-hide-location"
              type="checkbox"
              name="hide_location"
              checked={formData.hide_location}
              onChange={handleChange}
            />
            Keep location secret
          </label>
          <button
            className="btn btn--primary"
            disabled={saving}
            aria-busy={saving}
          >
            Save Changes
          </button>
          {saveError && (
            <output className="error" aria-live="assertive" role="alert">
              {saveError}
            </output>
          )}
        </form>
      </div>
    </div>
  );
}
