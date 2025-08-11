import { useNavigate } from "react-router";
import { useState } from "react";
import useMutation from "../api/useMutation"; //custom hook to cr8 POST req

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

  //update state when user types in input
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  //handle submit event
  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      species: formData.species,
      date_found: formData.date_found,
      description: formData.description,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      location: formData.location || null,
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
        <label>
          Latitude:
          <input
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            required
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
            required
          />
        </label>
        <label>
          Location label (optional):
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Eugene, OR trailhead"
          />
        </label>
        <button disabled={loading}>Create Find</button>{" "}
        {/* ^^ disable btn when loading */}
        {error && <output>{error}</output>}
      </form>
    </>
  );
}
