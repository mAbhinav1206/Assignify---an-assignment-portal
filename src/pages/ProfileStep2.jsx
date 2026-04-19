import React, { useState } from "react";
import LoginNavbar from "../components/LoginNavbar";
import "../css/Profile.css";
import { useNavigate } from "react-router-dom";
import { apiRequest, getStoredUser, saveSession } from "../api";

function ProfileStep2() {

  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const savedProfile = storedUser?.profile || {};
  const [form, setForm] = useState({
    major: savedProfile.major || "",
    studentId: savedProfile.studentId || "",
    favoriteSubject: savedProfile.favoriteSubject || "",
    studyTime: savedProfile.studyTime || "",
    reminder: savedProfile.reminder || "",
    subjects: savedProfile.subjects || []
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value
    }));
    setError("");
  };

  const handleSubjectChange = (e) => {
    const { value, checked } = e.target;

    setForm((currentForm) => ({
      ...currentForm,
      subjects: checked
        ? [...currentForm.subjects, value]
        : currentForm.subjects.filter((subject) => subject !== value)
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.major || !form.studyTime || !form.reminder) {
      setError("Fill your major, study time, and reminder to finish setup");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          completed: true
        })
      });

      saveSession(data);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjects = [
    "Mathematics",
    "Physics",
    "Computer Science",
    "Economics",
    "Chemistry",
    "Biology"
  ];

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
              <input
                name="major"
                placeholder="Major / Department"
                value={form.major}
                onChange={handleChange}
              />
              <input
                name="studentId"
                placeholder="Student ID (optional)"
                value={form.studentId}
                onChange={handleChange}
              />
            </div>

            <input
              name="favoriteSubject"
              placeholder="Favorite Subject (optional)"
              value={form.favoriteSubject}
              onChange={handleChange}
            />

            <div className="formRow">
              <select name="studyTime" value={form.studyTime} onChange={handleChange}>
                <option value="">Preferred Study Time</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Night</option>
              </select>

              <select name="reminder" value={form.reminder} onChange={handleChange}>
                <option value="">Assignment Reminder</option>
                <option>1 Day Before</option>
                <option>2 Days Before</option>
                <option>1 Week Before</option>
              </select>
            </div>

            <div className="interests">

              <p>Select Subjects You Study</p>

              <div className="interestGrid">
                {subjects.map((subject) => (
                  <label key={subject}>
                    <input
                      type="checkbox"
                      value={subject}
                      checked={form.subjects.includes(subject)}
                      onChange={handleSubjectChange}
                    />
                    {subject}
                  </label>
                ))}
              </div>

            </div>

            {error && <p className="formError">{error}</p>}

            <button type="submit" className="saveBtn" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Finish Setup"}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default ProfileStep2;
