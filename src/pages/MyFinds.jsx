import useQuery from "../api/useQuery"; //hook to fetch data from backend
import useMutation from "../api/useMutation"; //hook to cr8 DELETE req

//vv fetches current user's finds from /finds/me, alias as "my-finds" for caching
export default function MyFinds() {
  const { data: finds, loading, error } = useQuery("/finds/me", "my-finds");

  //v sets up mutation to delete a find, invalidates "my-finds" after run
  const { mutate: deleteFind } = useMutation("DELETE", null, ["my-finds"]);
  //v called when delete btn is clicked
  //backend expects DELETE /finds/:id  but hook call is DELETE /finds
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
            <p>
              <strong>Location:</strong> {find.city}, {find.state},{" "}
              {find.country}
            </p>
            <button onClick={() => handleDelete(find.id)}>Delete</button>{" "}
            {/* del btn */}
            <button disabled>Edit</button>
          </div>
        ))}
      </div>
    </>
  );
}
