import React, { useState } from "react";
import LoginNavbar from "../components/LoginNavbar";
import "../css/Profile.css";
import { useNavigate } from "react-router-dom";
import { apiRequest, getStoredUser, saveSession } from "../api";

function ProfileSetup() {

    const navigate = useNavigate();
    const storedUser = getStoredUser();
    const savedProfile = storedUser?.profile || {};

    const [avatar, setAvatar] = useState(
        savedProfile.avatar?.startsWith("data:") ? savedProfile.avatar : null
    );
    const [form, setForm] = useState({
        fullName: savedProfile.fullName || "",
        username: savedProfile.username || "",
        university: savedProfile.university || "",
        course: savedProfile.course || "",
        year: savedProfile.year || ""
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatar(reader.result);
                setError("");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setForm((currentForm) => ({
            ...currentForm,
            [e.target.name]: e.target.value
        }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.fullName || !form.username || !form.course || !form.year) {
            setError("Fill your name, username, course, and year to continue");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await apiRequest("/profile", {
                method: "PUT",
                body: JSON.stringify({
                    ...form,
                    avatar,
                    completed: false
                })
            });

            saveSession(data);
            navigate("/profile-step-2");
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
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
                                accept="image/*"
                                hidden
                                onChange={handleAvatar}
                            />
                        </label>
                        <span className="optionalText">Optional</span>

                    </div>

                    {/* Form */}
                    <form className="profileForm" onSubmit={handleSubmit}>

                        <div className="formRow">
                            <input
                                name="fullName"
                                placeholder="Full Name"
                                value={form.fullName}
                                autoComplete="name"
                                onChange={handleChange}
                            />
                            <input
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                autoComplete="username"
                                onChange={handleChange}
                            />
                        </div>

                        <input
                            name="university"
                            placeholder="University / College (optional)"
                            value={form.university}
                            onChange={handleChange}
                        />

                        <div className="formRow">
                            <input
                                name="course"
                                placeholder="Course"
                                value={form.course}
                                onChange={handleChange}
                            />
                            <select name="year" value={form.year} onChange={handleChange}>
                                <option value="">Year of study</option>
                                <option>1st Year</option>
                                <option>2nd Year</option>
                                <option>3rd Year</option>
                                <option>4th Year</option>
                            </select>
                        </div>

                        {error && <p className="formError">{error}</p>}

                        <button type="submit" className="saveBtn" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save & Continue"}
                        </button>

                    </form>

                </div>

            </div>
        </div>
    );
}

export default ProfileSetup;
