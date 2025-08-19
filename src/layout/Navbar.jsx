import { NavLink } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { token, logout } = useAuth();
  const linkStyle = ({ isActive }) => ({
    padding: "6px 10px",
    borderRadius: 8,
    textDecoration: "none",
    color: "inherit",
    background: isActive ? "#eee" : "transparent",
    marginRight: 8,
  });

  return (
    <header
      id="navbar"
      style={{ borderBottom: "1px solid #ddd", marginBottom: 16 }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 0",
        }}
      >
        <NavLink to="/" style={linkStyle}>
          Home
        </NavLink>

        {/* Only when logged in */}
        {token ? (
          <>
            <NavLink to="/find-foragers" style={linkStyle}>
              Find Foragers
            </NavLink>
            <NavLink to="/create" style={linkStyle}>
              Create Find
            </NavLink>
            <NavLink to="/my-finds" style={linkStyle}>
              My Finds
            </NavLink>
            <button onClick={logout} style={{ marginLeft: "auto" }}>
              Log out
            </button>
          </>
        ) : (
          // availabe when logged out
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <NavLink to="/login" style={linkStyle}>
              Log in
            </NavLink>
            <NavLink to="/register" style={linkStyle}>
              Register
            </NavLink>
          </div>
        )}
      </nav>
    </header>
  );
}
