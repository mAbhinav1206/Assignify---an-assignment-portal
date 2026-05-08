import { useMemo, useState } from "react";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest } from "../api";
import useTeacherPageData from "../hooks/useTeacherPageData";

const defaultDraft = {
  fullName: "",
  username: "",
  institution: "",
  department: "",
  designation: "",
  course: "",
  year: "",
  subjects: "",
  subjectsHandled: "",
  bio: "",
};

const AdminUsers = () => {
  const { user, data: users = [], error: loadError, reload } = useTeacherPageData("/admin/users", "users");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [draft, setDraft] = useState(defaultDraft);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingBan, setIsApplyingBan] = useState(false);
  const [banType, setBanType] = useState("temporary");
  const [banDays, setBanDays] = useState("7");
  const [banReason, setBanReason] = useState("");

  const filteredUsers = useMemo(
    () => users.filter((item) => (roleFilter === "all" ? true : item.role === roleFilter)),
    [roleFilter, users]
  );

  const selectedUser = useMemo(
    () =>
      filteredUsers.find((item) => item.id === selectedUserId) ||
      users.find((item) => item.id === selectedUserId) ||
      null,
    [filteredUsers, selectedUserId, users]
  );

  const fillDraftFromUser = (nextUser) => {
    const profile = nextUser?.profile || {};
    setDraft({
      fullName: profile.fullName || "",
      username: profile.username || "",
      institution: profile.institution || profile.university || "",
      department: profile.department || profile.major || "",
      designation: profile.designation || "",
      course: profile.course || "",
      year: profile.year || "",
      subjects: profile.subjects?.join(", ") || "",
      subjectsHandled: profile.subjectsHandled?.join(", ") || "",
      bio: profile.bio || "",
    });
    setBanReason(nextUser?.ban?.reason || "");
  };

  const handleSelectUser = (nextUser) => {
    setSelectedUserId(nextUser.id);
    fillDraftFromUser(nextUser);
    setError("");
    setSuccessMessage("");
  };

  const handleChange = (event) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [event.target.name]: event.target.value,
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleSave = async () => {
    if (!selectedUser) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      await reload();
      setSuccessMessage("User details updated");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBan = async () => {
    if (!selectedUser) {
      return;
    }

    setIsApplyingBan(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/admin/users/${selectedUser.id}/ban`, {
        method: "POST",
        body: JSON.stringify({
          type: banType,
          days: banType === "temporary" ? Number(banDays) : undefined,
          reason: banReason,
        }),
      });
      await reload();
      setSuccessMessage(banType === "permanent" ? "User banned permanently" : "Temporary ban applied");
    } catch (banError) {
      setError(banError.message);
    } finally {
      setIsApplyingBan(false);
    }
  };

  const handleUnban = async () => {
    if (!selectedUser) {
      return;
    }

    setIsApplyingBan(true);
    setError("");
    setSuccessMessage("");

    try {
      await apiRequest(`/admin/users/${selectedUser.id}/unban`, {
        method: "POST",
      });
      await reload();
      setSuccessMessage("User unbanned");
    } catch (unbanError) {
      setError(unbanError.message);
    } finally {
      setIsApplyingBan(false);
    }
  };

  return (
    <TeacherShell
      user={user}
      title="User Management"
      intro="Review every teacher and student account, update their stored details, and control access when needed."
    >
      {(loadError || error) && <p className="formError">{loadError || error}</p>}
      {successMessage && <p className="teacherCopyMessage">{successMessage}</p>}

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>People</h2>
            <p>Choose a role filter, pick an account, then edit details or apply an access action.</p>
          </div>
        </div>

        <div className="adminFilterRow">
          {["all", "student", "teacher", "admin"].map((role) => (
            <button
              key={role}
              className={`adminFilterBtn ${roleFilter === role ? "adminFilterBtnActive" : ""}`}
              type="button"
              onClick={() => setRoleFilter(role)}
            >
              {role === "all" ? "All Users" : `${role[0].toUpperCase()}${role.slice(1)}s`}
            </button>
          ))}
        </div>

        <div className="teacherStudentExplorer">
          <div className="teacherStudentListPanel">
            <h3>Accounts</h3>
            <div className="teacherStudentList">
              {filteredUsers.map((item) => (
                <button
                  className={`teacherStudentListItem ${
                    selectedUserId === item.id ? "teacherStudentListItemActive" : ""
                  }`}
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectUser(item)}
                >
                  <span className="teacherStudentListAvatar">
                    {item.profile?.avatar ? (
                      <img src={item.profile.avatar} alt="" />
                    ) : (
                      <span>{(item.profile?.fullName || item.email || "U")[0]}</span>
                    )}
                  </span>
                  <span className="teacherStudentListContent">
                    <strong>{item.profile?.fullName || item.email}</strong>
                    <span>{item.role} {item.ban?.isActive ? "• banned" : ""}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="teacherStudentDetailPanel">
            {selectedUser ? (
              <>
                <div className="teacherStudentDetailHeader">
                  <div className="teacherStudentHead">
                    <div className="teacherStudentAvatar">
                      {selectedUser.profile?.avatar ? (
                        <img src={selectedUser.profile.avatar} alt="" />
                      ) : (
                        <span>{(selectedUser.profile?.fullName || selectedUser.email || "U")[0]}</span>
                      )}
                    </div>
                    <div>
                      <h3>{selectedUser.profile?.fullName || selectedUser.email}</h3>
                      <p>{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="teacherStudentStats">
                    <span>{selectedUser.role}</span>
                    <span>{selectedUser.ban?.isActive ? "Banned" : "Active"}</span>
                  </div>
                </div>

                <div className="adminUserFormGrid">
                  <input name="fullName" placeholder="Full name" value={draft.fullName} onChange={handleChange} />
                  <input name="username" placeholder="Username" value={draft.username} onChange={handleChange} />
                  <input name="institution" placeholder="Institution" value={draft.institution} onChange={handleChange} />
                  <input name="department" placeholder="Department" value={draft.department} onChange={handleChange} />
                  <input name="designation" placeholder="Designation" value={draft.designation} onChange={handleChange} />
                  <input name="course" placeholder="Course" value={draft.course} onChange={handleChange} />
                  <input name="year" placeholder="Year" value={draft.year} onChange={handleChange} />
                  <input name="subjects" placeholder="Subjects" value={draft.subjects} onChange={handleChange} />
                  <input
                    name="subjectsHandled"
                    placeholder="Subjects handled"
                    value={draft.subjectsHandled}
                    onChange={handleChange}
                  />
                  <textarea name="bio" placeholder="Bio" value={draft.bio} onChange={handleChange} />
                </div>

                <div className="teacherCardActions">
                  <button className="viewBtn" type="button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Details"}
                  </button>
                </div>

                <div className="profileDivider" />

                <div className="adminBanPanel">
                  <div className="teacherSectionHeader">
                    <div>
                      <h2>Access Control</h2>
                      <p>Apply a temporary ban for a limited number of days or block the account permanently.</p>
                    </div>
                  </div>

                  <div className="adminBanGrid">
                    <select value={banType} onChange={(event) => setBanType(event.target.value)}>
                      <option value="temporary">Temporary ban</option>
                      <option value="permanent">Permanent ban</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ban days"
                      value={banDays}
                      disabled={banType !== "temporary"}
                      onChange={(event) => setBanDays(event.target.value)}
                    />
                    <input
                      placeholder="Reason (optional)"
                      value={banReason}
                      onChange={(event) => setBanReason(event.target.value)}
                    />
                  </div>

                  <div className="teacherCardActions">
                    <button className="teacherDeleteBtn" type="button" onClick={handleBan} disabled={isApplyingBan}>
                      {isApplyingBan ? "Applying..." : banType === "permanent" ? "Ban for Lifetime" : "Apply Ban"}
                    </button>

                    {selectedUser.ban?.isActive && (
                      <button className="viewBtn" type="button" onClick={handleUnban} disabled={isApplyingBan}>
                        {isApplyingBan ? "Updating..." : "Remove Ban"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="emptyState">Choose an account to edit or ban.</p>
            )}
          </div>
        </div>
      </section>
    </TeacherShell>
  );
};

export default AdminUsers;
