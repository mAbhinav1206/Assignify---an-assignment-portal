import React from "react";
import Navbar from "../components/Navbar";
import SignupHeaderSection from "../components/SignupHeaderSection";
import SignupForm from "../components/SignupForm";
import SocialLogin from "../components/SocialLogin";
import SignupFooter from "../components/SignupFooter";


function Signup() {
  return (
    <div className="landingPage">
      <div className="mainContent">
        <div className="hero">

          <Navbar />
          <SignupHeaderSection />

          <div className="user">
            <SignupForm />
            <SocialLogin />
          </div>

          <SignupFooter />

        </div>
      </div>
    </div>
  );
}

export default Signup;