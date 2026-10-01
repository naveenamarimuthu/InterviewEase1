import React, {
  useState
} from "react";

import "./Login.css";

const API_URL =
  "http://localhost:5000/api/auth";

function Login({ onLogin }) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              password
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Login failed"
        );
      }

      localStorage.setItem(
        "interviewEaseToken",
        data.token
      );

      localStorage.setItem(
        "interviewEaseUser",
        JSON.stringify(
          data.user
        )
      );

      onLogin();

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🎯
        </div>

        <h1>
          InterviewEase
        </h1>

        <p className="login-subtitle">
          Interview Scheduling System
        </p>

        <div className="login-heading">
          <h2>
            Welcome Back
          </h2>

          <p>
            Sign in to manage your interviews
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
        >

          <div className="login-field">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
            />

          </div>

          <div className="login-field">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

          </div>

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In →"}
          </button>

        </form>

        <div className="login-footer">
          🔒 Secure Admin Login
        </div>

      </div>

    </div>
  );
}

export default Login;