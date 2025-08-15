import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ApiProvider } from "./api/ApiContext.jsx";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles/theme.css";
import "./styles/navbar.css";
import "./styles/welcome.css";
import "./styles/finds.css";
import "./styles/forms.css";
import "./styles/foragers.css";
import "./styles/facts.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ApiProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApiProvider>
  </AuthProvider>
);
