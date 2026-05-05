import StudentShell from "../components/student/StudentShell";
import useStudentWorkspaceData from "../hooks/useStudentWorkspaceData";

const ProgressPage = () => {
  const { user, stats, assignments, error, isLoading } = useStudentWorkspaceData();
  const submittedAssignments = assignments.filter((assignment) => assignment.submission);
  const pendingAssignments = assignments.filter((assignment) => !assignment.submission);

  return (
    <StudentShell
      user={user}
      title="Progress"
      intro="See how much work you have finished and what still needs attention."
    >
      {error && <p className="formError">{error}</p>}

      <section className="studentStatsGrid">
        <div className="studentMetricCard">
          <span>Completion rate</span>
          <strong>{isLoading ? "..." : `${stats?.completionRate ?? 0}%`}</strong>
        </div>
        <div className="studentMetricCard">
          <span>Submitted</span>
          <strong>{isLoading ? "..." : submittedAssignments.length}</strong>
        </div>
        <div className="studentMetricCard">
          <span>Pending</span>
          <strong>{isLoading ? "..." : pendingAssignments.length}</strong>
        </div>
      </section>

      <section className="studentGrid">
        <article className="studentCard">
          <div className="studentCardTop">
            <div>
              <h3>Submitted Work</h3>
              <p>Assignments you have already turned in.</p>
            </div>
          </div>
          <div className="studentList">
            {submittedAssignments.length === 0 ? (
              <p className="emptyState">No submitted work yet.</p>
            ) : (
              submittedAssignments.map((assignment) => (
                <div className="studentListItem" key={assignment.id}>
                  <strong>{assignment.title}</strong>
                  <span>{assignment.submission.fileName}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="studentCard">
          <div className="studentCardTop">
            <div>
              <h3>Still Pending</h3>
              <p>Assignments that still need your submission.</p>
            </div>
          </div>
          <div className="studentList">
            {pendingAssignments.length === 0 ? (
              <p className="emptyState">Everything is submitted. Nice work.</p>
            ) : (
              pendingAssignments.map((assignment) => (
                <div className="studentListItem" key={assignment.id}>
                  <strong>{assignment.title}</strong>
                  <span>{assignment.course}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </StudentShell>
  );
};

export default ProgressPage;
