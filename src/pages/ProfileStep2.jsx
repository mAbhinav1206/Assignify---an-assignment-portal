import React from "react";
import LoginNavbar from "../components/LoginNavbar";
import "../css/profile.css";
import { useNavigate } from "react-router-dom";

function ProfileStep2() {

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Later you can save the preferences to MongoDB here

    navigate("/dashboard");   // go to dashboard after onboarding
  };

  return (
    <div className="profileWrapper">

      <LoginNavbar />

      <div className="profilePage">

        {/* Step Indicator */}
        <div className="steps">
          <div className="step done">✓</div>
          <div className="stepLine active"></div>
          <div className="step active">2</div>
        </div>

        {/* Progress */}
        <div className="progressWrapper">
          <div className="progressBar">
            <div className="progressFill step2"></div>
          </div>
          <p className="progressText">
            Step 2 of 2 • Academic preferences
          </p>
        </div>

        <div className="profileCard">

          <h2>Academic Preferences</h2>
          <p className="subtitle">
            Help Assignify organize your assignments better
          </p>

          <form className="profileForm" onSubmit={handleSubmit}>

            <div className="formRow">
              <input placeholder="Major / Department" />
              <input placeholder="Student ID (optional)" />
            </div>

            <input placeholder="Favorite Subject" />

            <div className="formRow">
              <select>
                <option>Preferred Study Time</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Night</option>
              </select>

              <select>
                <option>Assignment Reminder</option>
                <option>1 Day Before</option>
                <option>2 Days Before</option>
                <option>1 Week Before</option>
              </select>
            </div>

            <div className="interests">

              <p>Select Subjects You Study</p>

              <div className="interestGrid">
                <label><input type="checkbox"/> Mathematics</label>
                <label><input type="checkbox"/> Physics</label>
                <label><input type="checkbox"/> Computer Science</label>
                <label><input type="checkbox"/> Economics</label>
                <label><input type="checkbox"/> Chemistry</label>
                <label><input type="checkbox"/> Biology</label>
              </div>

            </div>

            <button type="submit" className="saveBtn">
              Finish Setup
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default ProfileStep2;