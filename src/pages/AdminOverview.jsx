import TeacherShell from "../components/teacher/TeacherShell";
import useTeacherPageData from "../hooks/useTeacherPageData";

const AdminOverview = () => {
  const { user, data: stats, error } = useTeacherPageData("/admin/overview", "stats");
  const cards = [
    ["Students", stats?.studentsCount ?? 0],
    ["Teachers", stats?.teachersCount ?? 0],
    ["Admins", stats?.adminsCount ?? 0],
    ["Banned Users", stats?.bannedUsersCount ?? 0],
  ];

  return (
    <TeacherShell
      user={user}
      title="Admin Portal"
      intro="Manage the people side of Assignify from one place, including edits and access control."
    >
      {error && <p className="formError">{error}</p>}

      <section className="teacherStatsGrid">
        {cards.map(([label, value]) => (
          <article className="teacherStatCard" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>What you can do here</h2>
            <p>Use the Users section to edit teacher and student details, apply temporary bans, or ban accounts permanently.</p>
          </div>
        </div>

        <div className="teacherCourseGrid">
          <article className="teacherCourseCard">
            <div className="teacherCourseBody">
              <div className="teacherCourseTitleRow">
                <h3>Edit Profiles</h3>
              </div>
              <p>Adjust the stored details for students and teachers without exposing the entire database shape.</p>
            </div>
          </article>

          <article className="teacherCourseCard">
            <div className="teacherCourseBody">
              <div className="teacherCourseTitleRow">
                <h3>Temporary Bans</h3>
              </div>
              <p>Pause access for a limited number of days when an account needs a cooldown instead of a full removal.</p>
            </div>
          </article>

          <article className="teacherCourseCard">
            <div className="teacherCourseBody">
              <div className="teacherCourseTitleRow">
                <h3>Permanent Bans</h3>
              </div>
              <p>Block an account indefinitely when it should no longer be allowed into the platform.</p>
            </div>
          </article>
        </div>
      </section>
    </TeacherShell>
  );
};

export default AdminOverview;
