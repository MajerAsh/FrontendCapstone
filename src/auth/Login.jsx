import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./AuthContext";

import "../styles/theme.css";
import "../styles/forms.css";

/*Log in form */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async (formData) => {
    setError(null);
    setLoading(true);
    const username = formData.get("username");
    const password = formData.get("password");
    if (!username || !password) {
      setError("Username and password are required.");
      setLoading(false);
      return;
    }
    try {
      await login({ username, password });
      navigate("/");
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-screen">
      <div className="form-card">
        <h1 className="form-title">Log in to your account</h1>
        <form action={onLogin} aria-label="Login form">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            name="username"
            required
            autoComplete="username"
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            style={{ marginTop: "1rem" }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <output className="error" role="alert">
              {error}
            </output>
          )}
        </form>
        <p className="helper">
          <Link to="/register">Need an account? Register here.</Link>
        </p>
      </div>
    </div>
  );
}
