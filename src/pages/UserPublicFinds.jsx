import { useParams } from "react-router";
import useQuery from "../api/useQuery";
import SpeciesFacts from "../components/SpeciesFacts";

export default function UserPublicFinds() {
  const { username } = useParams();
  const {
    data: finds,
    loading,
    error,
  } = useQuery(`/users/${username}/finds`, "user-finds");

  return (
    <>
      <h1>{username}'s Finds</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!finds?.length && <p>No finds yet.</p>}

      <div className="finds-list">
        {finds?.map((f) => (
          <div key={f.id} className="find-card">
            <h2>{f.species}</h2>
            <p>
              <strong>Date:</strong> {f.date_found}
            </p>
            <p>
              <strong>Description:</strong> {f.description}
            </p>

            {/* thumb if theres a image_url */}
            {f.image_url && (
              <div style={{ margin: "8px 0" }}>
                <img
                  src={
                    f.image_url?.startsWith("http")
                      ? f.image_url // f vs find
                      : `${import.meta.env.VITE_API_URL}${f.image_url}` // f vs find
                  }
                  alt={`${f.species ?? "Mushroom"} photo`}
                  style={{ maxWidth: "80%", height: "auto", borderRadius: 8 }}
                />
              </div>
            )}
            {f.location && (
              <p>
                <strong>Location:</strong> {f.location}
              </p>
            )}
            {f.latitude != null && f.longitude != null && (
              <p>
                <strong>Coords:</strong> {f.latitude}, {f.longitude}
              </p>
            )}
            <SpeciesFacts name={find.species} />
          </div>
        ))}
      </div>
    </>
  );
}
