import { Link } from "react-router";
import useQuery from "../api/useQuery"; //hook to fetch data from backend
import useMutation from "../api/useMutation"; //hook to cr8 DELETE req
import SpeciesFacts from "../components/SpeciesFacts";

//vv fetches current user's finds from /finds/me, alias as "my-finds" for caching
export default function MyFinds() {
  const { data: finds, loading, error } = useQuery("/finds/me", "my-finds");
  //v sets up mutation to delete a find, invalidates "my-finds" after run
  const { mutate: deleteFind } = useMutation("DELETE", null, ["my-finds"]);

  //v called when delete btn is clicked
  async function handleDelete(findId) {
    const confirm = window.confirm(
      "Are you sure you want to delete this find?"
    );
    if (!confirm) return;
    await deleteFind(null, `/finds/${findId}`); //hoping useMutation will accept an override URL as a argument 🤞
  }

  return (
    <>
      <h1>My Mushroom Finds</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="finds-list">
        {finds?.length === 0 && <p>No finds yet. Go create one!</p>}
        {finds?.map((find) => (
          <div key={find.id} className="find-card">
            <h2>{find.species}</h2>
            <p>
              <strong>Date:</strong> {find.date_found}
            </p>
            <p>
              <strong>Description:</strong> {find.description}
            </p>
            {find.image_url && (
              <div style={{ margin: "8px 0" }}>
                <img
                  src={
                    find.image_url?.startsWith("http")
                      ? find.image_url
                      : `${import.meta.env.VITE_API_URL}${find.image_url}`
                  }
                  alt={`${find.species ?? "Mushroom"} photo`}
                  style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }}
                  loading="lazy"
                />
              </div>
            )}

            {/* location display */}
            {(() => {
              const hasCoords = find.latitude != null && find.longitude != null;

              const coords = hasCoords
                ? `(${Number(find.latitude).toFixed(5)}, ${Number(
                    find.longitude
                  ).toFixed(5)})`
                : null;

              const label = find.location?.trim();

              const display = label || coords || "Not specified";

              return (
                <p>
                  <strong>Location:</strong> {display}
                </p>
              );
            })()}

            {/*safety badge and fact sheet*/}
            <SpeciesFacts name={find.species} />
            <button onClick={() => handleDelete(find.id)}>Delete</button>
            <Link to={`/edit/${find.id}`} style={{ marginLeft: 8 }}>
              Edit
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
