import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../api";
import { getStoredSettings } from "../settings";

function LoginForm() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Enter email and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role: mode })
      });

      saveSession(data);
      const settings = getStoredSettings();
      navigate(
        data.user?.role === "teacher"
          ? "/teacher"
          : data.user?.profile?.completed
            ? settings.autoOpenDashboard
              ? "/dashboard"
              : "/profile"
            : "/profile-setup"
      );

    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="leftBox">
      <div className="userCredentials">

        <div className="authModeSwitch">
          <button
            className={`authModeBtn ${mode === "student" ? "authModeActive" : ""}`}
            type="button"
            onClick={() => setMode("student")}
          >
            Student Login
          </button>
          <button
            className={`authModeBtn ${mode === "teacher" ? "authModeActive" : ""}`}
            type="button"
            onClick={() => setMode("teacher")}
          >
            Teacher Login
          </button>
        </div>

        <div className="email inputBox">
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="password inputBox">
          <input
            type="password"
            placeholder="Password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="formError">{error}</p>}

        <div className="forgotEmail">
          <u>Forgot email or password?</u>
        </div>

        <div className="submitBtn">
          <button type="button" onClick={handleLogin} disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </div>

        {mode === "teacher" && (
          <div className="teacherSignupLink">
            Need a teacher account?{" "}
            <button type="button" onClick={() => navigate("/teacher-signup")}>
              Sign up here
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default LoginForm;
