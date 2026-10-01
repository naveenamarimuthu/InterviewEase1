import React, {
  useState
} from "react";

import "./Login.css";

// =====================================================
// API URL
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://interviewease1-1.onrender.com/api/interviews";
// Convert interview API URL to auth API URL
const AUTH_API_URL =
  API_URL.replace(
    "/api/interviews",
    "/api/auth"
  );

// =====================================================
// LOGIN
// =====================================================

function Login({ onLogin }) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ===================================================
  // HANDLE LOGIN
  // ===================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");
      setLoading(true);

      try {

        const response =
          await fetch(
            `${AUTH_API_URL}/login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({
                  email:
                    email.trim(),

                  password
                })
            }
          );


        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Login failed"
          );
        }


        // ===============================================
        // SAVE TOKEN
        // ===============================================

        localStorage.setItem(
          "interviewEaseToken",
          data.token
        );


        // ===============================================
        // SAVE USER
        // ===============================================

        localStorage.setItem(
          "interviewEaseUser",
          JSON.stringify(
            data.user
          )
        );


        // ===============================================
        // LOGIN SUCCESS
        // ===============================================

        onLogin();

      } catch (err) {

        console.error(
          "LOGIN ERROR:",
          err
        );


        // Browser/network error
        if (
          err instanceof TypeError
        ) {

          setError(
            "Unable to connect to server. Please try again."
          );

        } else {

          setError(
            err.message ||
            "Login failed"
          );
        }

      } finally {

        setLoading(false);
      }
    };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="login-page">

      <div className="login-card">


        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">
          🎯
        </div>


        {/* =================================================
            TITLE
        ================================================= */}

        <h1>
          InterviewEase
        </h1>


        <p className="login-subtitle">
          Interview Scheduling System
        </p>


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="login-heading">

          <h2>
            Welcome Back
          </h2>

          <p>
            Sign in to manage your interviews
          </p>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            handleSubmit
          }
        >


          {/* =================================================
              EMAIL
          ================================================= */}

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
              autoComplete="email"
            />

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

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
              autoComplete="current-password"
            />

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="login-error">
              ⚠️ {error}
            </div>

          )}


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

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


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="login-footer">
          🔒 Secure Admin Login
        </div>


      </div>

    </div>
  );
}

export default Login;