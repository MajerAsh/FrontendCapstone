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
  });
  const [file, setFile] = useState(null);

  //mini maps
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  //fill state once Find loads
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
      });
    }
  }, [find]);

  //center on existing coords (if present) after find loads
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
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  }
  //file input
  function handleFile(e) {
    setFile(e.target.files?.[0] || null);
  }
  //call PUT with override path:
  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("species", formData.species);
    fd.append("date_found", formData.date_found);
    if (formData.description) fd.append("description", formData.description);
    if (formData.latitude !== "") fd.append("latitude", formData.latitude);
    if (formData.longitude !== "") fd.append("longitude", formData.longitude);
    if (formData.location) fd.append("location", formData.location);
    if (file) fd.append("photo", file);

    const ok = await mutate(fd, `/finds/${id}`); //overridePath to the right endpoint
    if (ok) navigate("/my-finds"); //go back to list
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!find) return <p>Not found.</p>; //404 case

  return (
    <div className="form-screen">
      <div className="form-card">
        <h1 className="form-title">Edit Find</h1>

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

          <div className="two-col">
            <label>
              Latitude:
              <input
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Click map to set"
              />
            </label>
            <label>
              Longitude:
              <input
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Click map to set"
              />
            </label>
          </div>

          <div ref={mapContainerRef} className="mini-map" />

          <label>
            Location label (optional):
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </label>

          <label>
            Replace photo (optional):
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleFile}
            />
          </label>

          <button disabled={saving}>Save Changes</button>
          {saveError && <output className="error">{saveError}</output>}
        </form>
      </div>
    </div>
  );
}
