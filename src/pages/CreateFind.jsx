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
    city: "",
    state: "",
    country: "",
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
      location: [formData.city, formData.state, formData.country]
        .filter(Boolean)
        .join(", "),
      // latitude/longitude/image_url can be added later
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
            name="found_date"
            value={formData.found_date}
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
          City:
          <input name="city" value={formData.city} onChange={handleChange} />
        </label>
        <label>
          State:
          <input name="state" value={formData.state} onChange={handleChange} />
        </label>
        <label>
          Country:
          <input
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </label>
        <button disabled={loading}>Create Find</button>{" "}
        {/* ^^ disable btn when loading */}
        {error && <output>{error}</output>}
      </form>
    </>
  );
}
