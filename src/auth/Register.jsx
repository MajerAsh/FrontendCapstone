import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import "../styles/theme.css";
import "../styles/forms.css";

/** Register form */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  const onRegister = async (formData) => {
    setError(null);
    setLoading(true);
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await register({ username, password });
      navigate("/");
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-screen">
      <div className="form-card" role="main" aria-labelledby="register-title">
        <h1 className="form-title" id="register-title">
          Register for an account
        </h1>
        <p className="form-instructions" style={{ marginBottom: "1em" }}>
          Username must be 3-32 characters. Password must be at least 6
          characters.
        </p>
        <form
          ref={formRef}
          action={async (formData) => {
            if (loading) return;
            await onRegister(formData);
          }}
          aria-describedby={error ? "register-error" : undefined}
        >
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            type="text"
            name="username"
            required
            autoComplete="username"
            aria-required="true"
            aria-label="Username"
            disabled={loading}
          />
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
            aria-required="true"
            aria-label="Password"
            disabled={loading}
          />
          <div style={{ height: "1.1em" }} />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          {error && (
            <output
              id="register-error"
              className="error"
              aria-live="assertive"
              role="alert"
            >
              {error}
            </output>
          )}
        </form>
        <p className="helper">
          <Link to="/login">Already have an account? Log in here.</Link>
        </p>
      </div>
    </div>
  );
}
