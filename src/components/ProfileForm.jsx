import React, { useState } from "react";
import "../css/profile.css";

function ProfileForm() {

  const [form, setForm] = useState({
    name: "",
    university: "",
    course: "",
    year: "",
    phone: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert("Profile Saved!");
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
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>University / College</label>
            <input
              type="text"
              name="university"
              placeholder="Enter your university"
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Course</label>
            <input
              type="text"
              name="course"
              placeholder="Example: B.Tech Computer Science"
              onChange={handleChange}
            />
          </div>

          <div className="formGroup">
            <label>Year of Study</label>
            <select name="year" onChange={handleChange}>
              <option>Select year</option>
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
              onChange={handleChange}
            />
          </div>

          <button className="saveProfileBtn">
            Save Profile
          </button>

        </form>

      </div>

    </div>
  );
}

export default ProfileForm;