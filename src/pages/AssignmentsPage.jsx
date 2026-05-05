import AssignmentList from "../components/dashboard/AssignmentList";
import StudentShell from "../components/student/StudentShell";
import useStudentWorkspaceData from "../hooks/useStudentWorkspaceData";

const AssignmentsPage = () => {
  const { user, assignments, error, isLoading, reload } = useStudentWorkspaceData();

  return (
    <StudentShell
      user={user}
      title="Assignments"
      intro="Track current work, submit files, and keep your active deadlines under control."
    >
      {error && <p className="formError">{error}</p>}
      <AssignmentList assignments={assignments} isLoading={isLoading} onSubmitted={reload} />
    </StudentShell>
  );
};

export default AssignmentsPage;
