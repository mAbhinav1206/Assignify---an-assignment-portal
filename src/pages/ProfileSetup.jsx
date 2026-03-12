import React, { useState } from "react";
import LoginNavbar from "../components/LoginNavbar";
import "../css/profile.css";
import { useNavigate } from "react-router-dom";

function ProfileSetup() {

    const navigate = useNavigate();

    const [avatar, setAvatar] = useState(null);

    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();   // stop page refresh

        // later can save profile data here

        navigate("/profile-step-2");   // go to step 2
    };

    return (
        <div className="profileWrapper">

            <LoginNavbar />

            <div className="profilePage">

                {/* Step Indicator */}
                <div className="steps">
                    <div className="step active">1</div>
                    <div className="stepLine"></div>
                    <div className="step">2</div>
                </div>

                {/* Progress */}
                <div className="progressWrapper">
                    <div className="progressBar">
                        <div className="progressFill"></div>
                    </div>
                    <p className="progressText">
                        Step 1 of 2 • Complete your profile
                    </p>
                </div>

                <div className="profileCard">

                    <h2>Complete your profile</h2>
                    <p className="subtitle">
                        Tell us about yourself to get started.
                    </p>

                    {/* Avatar Upload */}
                    <div className="avatarSection">

                        <div className="avatarCircle">
                            {avatar ? (
                                <img src={avatar} alt="avatar" />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>

                        <label className="uploadBtn">
                            Upload Photo
                            <input
                                type="file"
                                hidden
                                onChange={handleAvatar}
                            />
                        </label>

                    </div>

                    {/* Form */}
                    <form className="profileForm" onSubmit={handleSubmit}>

                        <div className="formRow">
                            <input placeholder="Full Name" />
                            <input placeholder="Username" />
                        </div>

                        <input placeholder="University / College" />

                        <div className="formRow">
                            <input placeholder="Course" />
                            <select>
                                <option>Year of study</option>
                                <option>1st Year</option>
                                <option>2nd Year</option>
                                <option>3rd Year</option>
                                <option>4th Year</option>
                            </select>
                        </div>

                        <button type="submit" className="saveBtn">
                            Save & Continue
                        </button>

                    </form>

                </div>

            </div>
        </div>
    );
}

export default ProfileSetup;