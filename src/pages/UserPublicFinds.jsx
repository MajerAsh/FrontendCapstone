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
            "The Seasoned Forager badge!\nSeasoned foragers have 10+\ndistinct finds",
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

  return (
    <section
      className="finds container forest-rays"
      role="main"
      aria-labelledby="user-finds-title"
    >
      <div className="header-row">
        <h1
          className="header-title"
          id="user-finds-title"
        >{`${username}'s Finds`}</h1>
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
      {!finds?.length && <p>No finds yet.</p>}

      <div className="finds-list">
        {finds?.map((find) => (
          <article
            key={find.id}
            className="find-card"
            tabIndex={0}
            aria-labelledby={`find-title-${find.id}`}
          >
            <section className="corner-sticker corner-sticker--gnome">
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
                  />
                </div>
              )}
              {/*location block*/}
              {find.location && !find.hide_location && (
                <p>
                  <strong>Location:</strong> {find.location}
                </p>
              )}
              {find.hide_location && (
                <p className="secret-note">
                  <strong>Location:</strong> kept secret
                </p>
              )}

              {find.latitude != null &&
                find.longitude != null &&
                !find.hide_location && (
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
