import { useParams } from "react-router";
import useQuery from "../api/useQuery";

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
          </div>
        ))}
      </div>
    </>
  );
}
