import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest, getStoredUser, saveSession } from "../api";

const TeacherProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [error, setError] = useState("");
  const profile = user?.profile || {};
  const teacherDetails = [
    ["Username", profile.username],
    ["Institution", profile.institution || profile.university],
    ["Department", profile.department || profile.major],
    ["Designation", profile.designation],
    ["Office Hours", profile.officeHours],
  ];
  const teachingProfile = [
    ["Subjects Handled", profile.subjectsHandled?.length ? profile.subjectsHandled.join(", ") : ""],
    ["Bio", profile.bio],
  ];

  const renderField = ([label, value]) => (
    <div className="profileField" key={label}>
      <span>{label}</span>
      <strong>{value || "Not added"}</strong>
    </div>
  );

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest("/me");
        saveSession(data);
        setUser(data.user);
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadProfile();
  }, []);

  return (
    <TeacherShell
      user={user}
      title=""
      intro=""
    >
      <div className="profileHeader">
        <div className="profileAvatarLarge">
          {profile.avatar ? <img src={profile.avatar} alt="Teacher profile" /> : <span>{profile.fullName?.[0] || "T"}</span>}
        </div>

        <div>
          <h1 className="welcomeTitle">{profile.fullName || "Teacher Profile"}</h1>
          <p className="profileEmail">{user?.email}</p>
        </div>
      </div>

      {error && <p className="formError">{error}</p>}

      <section className="profilePanel">
        <div className="profileSectionHeader">
          <div>
            <h2>Profile Information</h2>
            <p>Your teaching identity and workspace details in one place.</p>
          </div>
        </div>

        <div className="profileSection">
          <h3>Teacher Details</h3>
          <div className="profileFieldGrid">
            {teacherDetails.map(renderField)}
          </div>
        </div>

        <div className="profileDivider" />

        <div className="profileSection">
          <h3>Teaching Profile</h3>
          <div className="profileFieldGrid">
            {teachingProfile.map(renderField)}
          </div>
        </div>
      </section>

      <div className="profileActions">
        <button className="viewBtn" type="button" onClick={() => navigate("/teacher/profile/edit")}>
          Edit Teacher Profile
        </button>
      </div>
    </TeacherShell>
  );
};

export default TeacherProfile;
