import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.message === "Login successful") {
        navigate("/dashboard");
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log(error);
      alert("Server error");
    }
  };

  return (
    <div className="leftBox">
      <div className="userCredentials">

        <div className="email inputBox">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="password inputBox">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="forgotEmail">
          <u>Forgot email ?</u>
        </div>

        <div className="submitBtn">
          <button type="button" onClick={handleLogin}>
            Log In
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginForm;