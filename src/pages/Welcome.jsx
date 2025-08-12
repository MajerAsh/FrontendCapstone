import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import useQuery from "../api/useQuery"; //fetch wrapper for API calls
import { useAuth } from "../auth/AuthContext";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; //mapbox API key from .env

export default function Welcome() {
  //map stuff:
  const mapContainer = useRef(null); //ref to <div> that holds the map
  const map = useRef(null); //store map instance
  const markers = useRef([]); //holds active markers (incase they need to go)

  const [filter, setFilter] = useState(""); //input text for filtering Finds

  const { data: finds } = useQuery("/finds", "all-finds");
  const { token } = useAuth();

  //helper to make absolute img URLs
  const imgSrc = (pathOrUrl) => {
    if (!pathOrUrl) return null;
    return pathOrUrl.startsWith("http")
      ? pathOrUrl
      : `${import.meta.env.VITE_API_URL}${pathOrUrl}`;
  };

  // Init the map 1x
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current, //connect mapbox to <div>
      style: "mapbox://styles/mapbox/streets-v11", //map style
      center: [-98, 39], // USA center
      zoom: 3,
    });
  }, []);

  // Add MARKERS when finds load or filter changes
  useEffect(() => {
    if (!map.current || !finds) return;

    //rmv old markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    // bounds to fit all visible markers
    const bounds = new mapboxgl.LngLatBounds();
    let added = 0;

    //loop over filtered finds and add markers
    finds
      .filter(
        (find) =>
          filter === "" ||
          (find.species || "").toLowerCase().includes(filter.toLowerCase())
      )
      .forEach((find) => {
        if (find.longitude == null || find.latitude == null) return;

        const label = (find.location || "").trim();
        const coords =
          find.latitude != null && find.longitude != null
            ? `(${Number(find.latitude).toFixed(5)}, ${Number(
                find.longitude
              ).toFixed(5)})`
            : "";

        //vPOPUP BLOCKv
        const popupContent = `
          <strong>${find.species ?? "Unknown"}</strong><br/>
          ${find.date_found ?? ""}.slice(0, 10)}<br/>
           ${label || coords ? `${label || coords}<br/>` : ""}
         ${
           find.image_url
             ? `<div style="margin:8px 0">
       <img
         src="${imgSrc(find.image_url)}" 
         alt="${(find.species ?? "Mushroom").replace(/"/g, "&quot;")} photo"
         style="max-width:80%;height:auto;border-radius:8px"
           loading="lazy"
  referrerpolicy="no-referrer"
       />
     </div>`
             : ""
         }
 ${token ? `<a href="/user/${find.username}/finds">${find.username}</a>` : ""}
`; //popup HTML content/show link if logged in ^^

        const marker = new mapboxgl.Marker()
          .setLngLat([find.longitude, find.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent)) //attach popup
          .addTo(map.current);

        markers.current.push(marker); //push marker to track it/ if it needs to b removed
        bounds.extend([find.longitude, find.latitude]);
        added += 1;
      });

    // if we placed any markers, fit the view to them
    if (added > 0) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 6, duration: 800 });
    }
  }, [finds, filter, token]);

  //^

  return (
    <>
      <h1>Welcome to MycoMap </h1>
      <label>
        Filter by species or location:
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />{" "}
        {/* input updates filter state */}
      </label>
      <div ref={mapContainer} style={{ height: "500px" }} /> {/* THE MAP */}
    </>
  );
}
