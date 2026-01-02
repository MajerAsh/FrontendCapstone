import { Link } from "react-router";
import useQuery from "../api/useQuery"; 
import useMutation from "../api/useMutation"; //hook to cr8 DELETE req
import SpeciesFacts from "../components/SpeciesFacts";

import "../styles/theme.css";
import "../styles/finds.css";

//// "my-finds" is used as an invalidation tag after create/edit/delete
export default function MyFinds() {
  const { data: finds, loading, error } = useQuery("/finds/me", "my-finds");
  const { mutate: deleteFind } = useMutation("DELETE", null, ["my-finds"]);
  const myBadge = finds?.[0]?.badge ?? null;

  const badgeMeta = (label) => {
    switch (label) {
      case "Myco Master":
        return {
          src: "/svgs/MycoMaster.svg",
          title:
            "The Myco Master badge!\nMyco masters have\n25+ distinct finds",
        };
      case "Seasoned Forager":
        return {
          src: "/svgs/seasonedforager.svg",
          title:
            "The Seasoned Forager badge!\nSeasoned foragers have\n10+ distinct finds",
        };
      case "Fruiting":
        return {
          src: "/svgs/fruiting.svg",
          title:
            "The Fruiting Forager badge!\nFruiting foragers have five or\nmore distinct finds",
        };
      default:
        return null;
    }
  };

  //v called when delete btn is clicked
  async function handleDelete(findId) {
    const confirm = window.confirm(
      "Are you sure you want to delete this find?"
    );
    if (!confirm) return;
    await deleteFind(null, `/finds/${findId}`); 

  return (
    <section
      className="finds container forest-rays"
      role="main"
      aria-labelledby="my-finds-title"
    >
      <div className="header-row">
        <h1 className="header-title" id="my-finds-title">
          My Mushroom Finds
        </h1>
        {myBadge &&
          (() => {
            const m = badgeMeta(myBadge);
            return m ? (
              <img
                className="user-badge"
                src={m.src}
                alt={`${myBadge} badge`}
                title={m.title}
              />
            ) : null;
          })()}
      </div>

      {loading && <p aria-live="polite">Loading...</p>}
      {error && (
        <output className="error" aria-live="assertive" role="alert">
          {error}
        </output>
      )}

      <div className="finds-list">
        {finds?.length === 0 && <p>No finds yet. Go create one!</p>}

        {finds?.map((find) => (
          <article
            key={find.id}
            className="find-card corner-sticker corner-sticker--mushroom"
            tabIndex={0}
            aria-labelledby={`find-title-${find.id}`}
          >
            <h2 id={`find-title-${find.id}`}>{find.species}</h2>

            <p>
              <strong>Date:</strong> {find.date_found}
            </p>
            <p>
              <strong>Description:</strong> {find.description}
            </p>

            {find.image_url && (
              <div className="media">
                <img
                  src={
                    find.image_url?.startsWith("http")
                      ? find.image_url
                      : `${import.meta.env.VITE_API_URL}${find.image_url}`
                  }
                  alt={`${find.species ?? "Mushroom"} photo`}
                  loading="lazy"
                  onError={(e) => {
                    // avoid infinite loop if placeholder missing
                    e.currentTarget.onerror = null;
                    // use sad mushroom placeholder from public/svgs
                    e.currentTarget.src = "/svgs/sadmushroom.png";
                  }}
                />
              </div>
            )}
            {find.hide_location && (
              <span
                className="badge badge--secret"
                title="Location is hidden to protect sensitive habitats. Only you can see the exact coordinates."
              >
                <img src="/svgs/lock.svg" alt="Locked" className="lock-icon" />
                Location Secret
              </span>
            )}
            {/* location display  */}
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

            {/* safety badge + fact sheet */}
            <SpeciesFacts name={find.species} />

            <div className="actions">
              <button
                onClick={() => handleDelete(find.id)}
                className="btn btn--danger actions__btn"
                aria-label={`Delete find for ${find.species}`}
                type="button"
              >
                Delete
              </button>
              <Link
                to={`/edit/${find.id}`}
                className="btn btn--primary actions__btn"
                aria-label={`Edit find for ${find.species}`}
                tabIndex={0}
              >
                Edit
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
