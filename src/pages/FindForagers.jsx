import { useEffect, useState } from "react";
import useQuery from "../api/useQuery";
import { Link } from "react-router";

export default function FindForagers() {
  const [term, setTerm] = useState("");
  const resource = term
    ? `/users?search=${encodeURIComponent(term)}`
    : "/users?search=";
  const { data: users, loading, error } = useQuery(resource, "user-search");

  const [input, setInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setTerm(input.trim()), 300);
    return () => clearTimeout(t);
  }, [input]);

  return (
    <>
      <h1>Find Foragers</h1>
      <label>
        Search by username:
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. mushroom_mary"
        />
      </label>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {(users ?? []).map((u) => (
          <li key={u.id}>
            <Link to={`/user/${u.username}/finds`}>{u.username}</Link>
            {u.city || u.state
              ? ` — ${[u.city, u.state].filter(Boolean).join(", ")}`
              : ""}
          </li>
        ))}
      </ul>
    </>
  );
}
