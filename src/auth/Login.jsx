import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./AuthContext";

import "../styles/theme.css";
import "../styles/forms.css";

/*form that allows users to log into an existing account. */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onLogin = async (formData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await login({ username, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="form-screen">
      <div className="form-card">
        <h1 className="form-title">Log in to your account</h1>

        <form action={onLogin}>
          <label>
            Username
            <input type="username" name="username" required />
          </label>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
          <button>Login</button>
          {error && <output className="error">{error}</output>}
        </form>

        <p className="helper">
          <Link to="/register">Need an account? Register here.</Link>
        </p>
      </div>
    </div>
  );
}
