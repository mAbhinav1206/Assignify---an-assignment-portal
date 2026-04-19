import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveSession } from "../api";

const SignupForm = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    setError("");

    if (!email || !confirmEmail || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (email !== confirmEmail) {
      setError("Emails do not match");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });

      saveSession(data);
      navigate("/profile-setup", { state: { email } });

    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="leftBox">
      <div className="userCredentials">

        <div className="email inputBox">
          <input
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="confirmEmail inputBox">
          <input
            type="email"
            placeholder="Confirm email"
            value={confirmEmail}
            autoComplete="email"
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
        </div>

        <div className="password inputBox">
          <input
            type="password"
            placeholder="Choose a password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="confirmPassword inputBox">
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="formError">{error}</p>}

        <div className="submitBtn">
          <button type="button" onClick={handleSignup} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SignupForm;
