import { useEffect, useState } from "react";
import useQuery from "../api/useQuery";
import { Link } from "react-router"; //react router's Link component for navigation
import BadgePill from "../components/BadgePill";

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
    <section
      className="foragers container"
      role="main"
      aria-labelledby="foragers-title"
    >
      <section className="corner-sticker corner-sticker--gnome">
        <h1 id="foragers-title" className="sr-only">
          Find Foragers
        </h1>
        <label htmlFor="forager-search">Search by username:</label>
        <input
          id="forager-search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. mushroom_mary"
          aria-label="Search by username"
        />

        {loading && <p aria-live="polite">Loading...</p>}
        {error && (
          <output className="error" aria-live="assertive" role="alert">
            {error}
          </output>
        )}

        <ul>
          {(users ?? []).map((u) => (
            <li key={u.id}>
              <Link
                to={`/user/${u.username}/finds`}
                className="btn btn--link"
                aria-label={`View finds for ${u.username}`}
              >
                {u.username}
              </Link>
              <BadgePill badge={u.badge} />
              {u.city || u.state
                ? ` \u2014 ${[u.city, u.state].filter(Boolean).join(", ")}`
                : ""}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
