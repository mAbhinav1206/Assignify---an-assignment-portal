import React, { useState } from "react";
import "../css/Profile.css";
import { apiRequest, saveSession } from "../api";

function ProfileForm() {

  const [form, setForm] = useState({
    name: "",
    university: "",
    course: "",
    year: "",
    phone: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.name || !form.university || !form.course || !form.year || !form.phone) {
      setError("Please complete every field");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: form.name,
          university: form.university,
          course: form.course,
          year: form.year,
          phone: form.phone
        })
      });

      saveSession(data);
      setMessage("Profile saved");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profilePage">

      <div className="profileCard">

        <h2 className="profileTitle">Complete Your Profile</h2>
        <p className="profileSubtitle">
          Tell us a little about yourself
        </p>

        <form onSubmit={handleSubmit} className="profileForm">

          <div className="formGroup">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>University / College</label>
            <input
              type="text"
              name="university"
              placeholder="Enter your university"
              value={form.university}
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Course</label>
            <input
              type="text"
              name="course"
              placeholder="Example: B.Tech Computer Science"
              value={form.course}
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Year of Study</label>
            <select name="year" value={form.year} onChange={handleChange}>
              <option value="">Select year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </div>

          <div className="formGroup">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {error && <p className="formError">{error}</p>}
          {message && <p className="formSuccess">{message}</p>}

          <button className="saveProfileBtn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default ProfileForm;
