import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import useQuery from "../api/useQuery"; //fetch wrapper for API calls
import { useAuth } from "../auth/AuthContext";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; //mapbox API key from .env

export default function Welcome() {
  const mapContainer = useRef(null); //ref to <div> that holds the map
  const map = useRef(null); //store map instance
  const markers = useRef([]); //holds active markers (incase they need to go)
  const [filter, setFilter] = useState(""); //input text for filtering Finds
  const { data: finds } = useQuery("/finds", "all-finds"); //fetch all finds from API
  const { token } = useAuth(); //get login token(to show user links)

  // Initialize the map 1x
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current, //connect mapbox to <div>
      style: "mapbox://styles/mapbox/streets-v11", //map style
      center: [-98, 39], // USA center
      zoom: 3,
    });
  }, []);

  // Add MARKERS (not layrs! removed layers) when finds load or filter changes
  useEffect(() => {
    if (!map.current || !finds) return;

    //rmv any existing markers (removed layers) from previous render
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    //loop over filtered finds and add markers
    finds
      .filter(
        (find) =>
          filter === "" ||
          (find.species || "").toLowerCase().includes(filter.toLowerCase())
      )
      .forEach((find) => {
        if (find.longitude == null || find.latitude == null) return;

        const popupContent = `
          <strong>${find.species ?? "Unknown"}</strong><br/>
          ${find.date_found ?? ""}<br/>
          ${
            token
              ? `<a href="/user/${find.username}/finds">${find.username}</a>`
              : ""
          }
        `; //popup HTML content/show link if logged in ^^

        const marker = new mapboxgl.Marker()
          .setLngLat([find.longitude, find.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent)) //attach popup
          .addTo(map.current);

        markers.current.push(marker); //push marker to track it/ if it needs to b removed
      });
  }, [finds, filter, token]);

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
