import { useParams } from "react-router";
import useQuery from "../api/useQuery";
import SpeciesFacts from "../components/SpeciesFacts";

export default function UserPublicFinds() {
  // grab finds for a user's username
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
        {finds?.map((find) => (
          <div key={find.id} className="find-card">
            <h2>{find.species}</h2>
            <p>
              <strong>Date:</strong> {find.date_found}
            </p>
            <p>
              <strong>Description:</strong> {find.description}
            </p>

            {/* thumb if theres a image_url */}
            {find.image_url && (
              <div style={{ margin: "8px 0" }}>
                <img
                  src={
                    find.image_url?.startsWith("http")
                      ? find.image_url // f vs find
                      : `${import.meta.env.VITE_API_URL}${find.image_url}` // f vs find
                  }
                  alt={`${find.species ?? "Mushroom"} photo`}
                  style={{ maxWidth: "80%", height: "auto", borderRadius: 8 }}
                />
              </div>
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
          </div>
        ))}
      </div>
    </>
  );
}
