import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "./AuthContext";

import "../styles/theme.css";
import "../styles/forms.css";

/** A form that allows users to register for a new account */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const onRegister = async (formData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      await register({ username, password });
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="form-screen">
      <div className="form-card">
        <h1 className="form-title">Register for an account</h1>

        <form action={onRegister}>
          <label>
            Username
            <input type="text" name="username" required />
          </label>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
          <button>Register</button>
          {error && <output className="error">{error}</output>}
        </form>

        <p className="helper">
          <Link to="/login">Already have an account? Log in here.</Link>
        </p>
      </div>
    </div>
  );
}
