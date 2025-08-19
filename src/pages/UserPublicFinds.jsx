import { useParams } from "react-router";
import useQuery from "../api/useQuery";
import SpeciesFacts from "../components/SpeciesFacts";
//style:
import "../styles/theme.css";
import "../styles/finds.css";

export default function UserPublicFinds() {
  // grab finds for a user's username
  const { username } = useParams();
  const {
    data: finds,
    loading,
    error,
  } = useQuery(`/users/${username}/finds`, "user-finds");

  return (
    <section className="finds container forest-rays">
      <h1>{`${username}'s Finds`}</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!finds?.length && <p>No finds yet.</p>}

      <div className="finds-list">
        {finds?.map((find) => (
          <article key={find.id} className="find-card">
            <section className="corner-sticker corner-sticker--gnome">
              <h2>{find.species}</h2>

              <p>
                <strong>Date:</strong> {find.date_found}
              </p>
              <p>
                <strong>Description:</strong> {find.description}
              </p>

              {find.image_url && (
                <img
                  src={
                    find.image_url?.startsWith("http")
                      ? find.image_url
                      : `${import.meta.env.VITE_API_URL}${find.image_url}`
                  }
                  alt={`${find.species ?? "Mushroom"} photo`}
                  loading="lazy"
                />
              )}

              {find.location && (
                <p>
                  <strong>Location:</strong> {find.location}
                </p>
              )}
              {find.latitude != null && find.longitude != null && (
                <p>
                  <strong>Coords:</strong> {find.latitude}, {find.longitude}
                </p>
              )}

              <SpeciesFacts name={find.species} />
            </section>
          </article>
        ))}
      </div>
    </section>
  );
}
