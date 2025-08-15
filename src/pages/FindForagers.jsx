import { useEffect, useState } from "react";
import useQuery from "../api/useQuery";
import { Link } from "react-router"; //react router's Link component for navigation

export default function FindForagers() {
  //literal search term used in the api request ^
  const [term, setTerm] = useState("");

  // Build api resource URL depending on search term
  const resource = term
    ? `/users?search=${encodeURIComponent(term)}` // encode search to be URL safe
    : "/users?search=";
  //get user list from api:
  const { data: users, loading, error } = useQuery(resource, "user-search");

  //input value from the text box
  const [input, setInput] = useState("");

  //debounce: wait 300 ms after user stops typing
  useEffect(() => {
    //timer starts:
    const t = setTimeout(() => setTerm(input.trim()), 300);
    //cancel timer if they stop before 300 ms
    return () => clearTimeout(t);
  }, [input]);

  return (
    <section className="foragers container">
      <section className="corner-sticker corner-sticker--gnome">
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
      </section>
    </section>
  );
}
