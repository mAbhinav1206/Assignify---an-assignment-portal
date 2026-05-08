import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { apiRequest, getStoredUser, saveSession } from "../api";
import "../css/Profile.css";

const TeacherSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = getStoredUser();
  const savedProfile = storedUser?.profile || {};
  const isEditMode = location.pathname === "/teacher/profile/edit";
  const [avatar, setAvatar] = useState(
    savedProfile.avatar?.startsWith("data:") ? savedProfile.avatar : null
  );
  const [form, setForm] = useState({
    fullName: savedProfile.fullName || "",
    username: savedProfile.username || "",
    institution: savedProfile.institution || savedProfile.university || "",
    department: savedProfile.department || savedProfile.major || "",
    designation: savedProfile.designation || "",
    phone: savedProfile.phone || "",
    subjectsHandled: Array.isArray(savedProfile.subjectsHandled)
      ? savedProfile.subjectsHandled.join(", ")
      : "",
    officeHours: savedProfile.officeHours || "",
    bio: savedProfile.bio || "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const requiredFieldsMissing = useMemo(
    () =>
      !form.fullName ||
      !form.username ||
      !form.institution ||
      !form.department ||
      !form.designation ||
      !form.subjectsHandled,
    [form]
  );

  const handleAvatar = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
    setError("");
  };

  const getFieldClassName = (fieldName) => {
    const requiredFields = ["fullName", "username", "institution", "department", "designation", "subjectsHandled"];
    const isRequired = requiredFields.includes(fieldName);
    const isEmpty = !String(form[fieldName] || "").trim();

    return isRequired && showValidation && isEmpty ? "fieldInvalid" : "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setShowValidation(true);

    if (requiredFieldsMissing) {
      setError("Fill your main teacher details to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiRequest("/profile", {
        method: "PUT",
        body: JSON.stringify({
          avatar,
          fullName: form.fullName,
          username: form.username,
          institution: form.institution,
          university: form.institution,
          department: form.department,
          major: form.department,
          designation: form.designation,
          phone: form.phone,
          subjectsHandled: form.subjectsHandled
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          officeHours: form.officeHours,
          bio: form.bio,
          completed: true,
        }),
      });

      saveSession(data);
      navigate(isEditMode ? "/teacher/profile" : "/teacher/analytics");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profileWrapper">
      <LoginNavbar />

      <div className="profilePage teacherSetupPage">
        <div className="profileCard teacherSetupCard">
          <h2>{isEditMode ? "Edit your teacher profile" : "Complete your teacher profile"}</h2>
          <p className="subtitle">
            {isEditMode
              ? "Update your teaching details whenever your profile changes."
              : "Add your teaching details before opening the workspace."}
          </p>

          <div className="avatarSection">
            <div className="avatarCircle">
              {avatar ? <img src={avatar} alt="Teacher avatar" /> : <span>👩‍🏫</span>}
            </div>

            <label className="uploadBtn">
              Upload Photo
              <input type="file" accept="image/*" hidden onChange={handleAvatar} />
            </label>
            <span className="optionalText">Optional</span>
          </div>

          <form className="profileForm teacherSetupForm" onSubmit={handleSubmit}>
            <div className="formRow">
              <input
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                autoComplete="name"
                className={getFieldClassName("fullName")}
                onChange={handleChange}
              />
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                autoComplete="username"
                className={getFieldClassName("username")}
                onChange={handleChange}
              />
            </div>

            <div className="formRow">
              <input
                name="institution"
                placeholder="School / University"
                value={form.institution}
                className={getFieldClassName("institution")}
                onChange={handleChange}
              />
              <input
                name="department"
                placeholder="Department"
                value={form.department}
                className={getFieldClassName("department")}
                onChange={handleChange}
              />
            </div>

            <div className="formRow">
              <input
                name="designation"
                placeholder="Designation"
                value={form.designation}
                className={getFieldClassName("designation")}
                onChange={handleChange}
              />
              <input
                name="phone"
                placeholder="Phone (optional)"
                value={form.phone}
                autoComplete="tel"
                onChange={handleChange}
              />
            </div>

            <input
              name="subjectsHandled"
              placeholder="Subjects handled (comma separated)"
              value={form.subjectsHandled}
              className={getFieldClassName("subjectsHandled")}
              onChange={handleChange}
            />

            <input
              name="officeHours"
              placeholder="Office hours (optional)"
              value={form.officeHours}
              onChange={handleChange}
            />

            <textarea
              className="teacherSetupTextarea"
              name="bio"
              placeholder="Short bio (optional)"
              value={form.bio}
              onChange={handleChange}
            />

            {error && <p className="formError">{error}</p>}

            <button type="submit" className="saveBtn" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Save Changes" : "Save & Open Teacher Portal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherSetup;
