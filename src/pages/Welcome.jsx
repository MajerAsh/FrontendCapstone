import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import useQuery from "../api/useQuery"; //fetch wrapper for API calls
import { useAuth } from "../auth/AuthContext";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; //mapbox API key from .env

export default function Welcome() {
  const mapContainer = useRef(null); //ref to <div> that holds the map
  const map = useRef(null); //store map instance
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

  // Add markers when finds load or filter changes
  useEffect(() => {
    if (!map.current || !finds) return; //skip if map or data missing

    //clean up existing layers (old markers)
    map.current.eachLayer((layer) => {
      if (layer.type === "symbol" || layer.id.startsWith("find")) {
        try {
          map.current.removeLayer(layer.id); //rmv custom layer
        } catch {}
      }
    });

    //loop over filtered finds and add markers
    finds
      .filter(
        (find) =>
          filter === "" || //no filter = show all
          find.species.toLowerCase().includes(filter.toLowerCase()) ||
          find.country.toLowerCase().includes(filter.toLowerCase())
      )
      .forEach((find) => {
        const popupContent = `
          <strong>${find.species}</strong><br/>
          ${find.found_date}<br/>
          ${
            token
              ? `<a href="/user/${find.username}/finds">${find.username}</a>`
              : ""
          }
        `; //popup HTML content/show link if logged in ^^

        new mapboxgl.Marker()
          .setLngLat([find.longitude, find.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent)) //attach popup
          .addTo(map.current);
      });
  }, [finds, filter]);

  return (
    <>
      <h1>Welcome to MycoMap </h1>
      <label>
        Filter by species or country:
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
