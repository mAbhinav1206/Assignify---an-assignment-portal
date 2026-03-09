import React from "react";
import { Link } from "react-router-dom";

const SignupHeaderSection = () => {
  return (
    <div className="header">
      <div className="signup">
        <h1>Sign Up</h1>
      </div>

      <div className="newUser">
        Already have an account?{" "}
        <span>
          <Link to="/">Log In</Link>
        </span>
      </div>
    </div>
  );
};

export default SignupHeaderSection;