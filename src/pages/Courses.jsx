import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StudentShell from "../components/student/StudentShell";
import useStudentWorkspaceData from "../hooks/useStudentWorkspaceData";

const Courses = () => {
  const navigate = useNavigate();
  const { user, assignments, error, isLoading } = useStudentWorkspaceData();

  const courses = useMemo(() => {
    const counts = new Map();

    assignments.forEach((assignment) => {
      counts.set(assignment.course, (counts.get(assignment.course) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([name, assignmentCount]) => ({
      name,
      assignmentCount,
      isCurrent: user?.profile?.course === name,
    }));
  }, [assignments, user]);

  return (
    <StudentShell
      user={user}
      title="Courses"
      intro="See your joined course and quickly jump to the latest work for each class."
    >
      {error && <p className="formError">{error}</p>}

      <section className="studentGrid">
        {isLoading ? (
          <p className="emptyState">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="emptyState">No courses available yet.</p>
        ) : (
          courses.map((course) => (
            <article className="studentCard" key={course.name}>
              <div className="studentCardTop">
                <div>
                  <h3>{course.name}</h3>
                  <p>{course.assignmentCount} active assignments</p>
                </div>
                <span className={`studentBadge ${course.isCurrent ? "studentBadgePrimary" : ""}`}>
                  {course.isCurrent ? "Enrolled" : "Available"}
                </span>
              </div>

              <div className="studentCardActions">
                <button
                  className="viewBtn"
                  type="button"
                  onClick={() => navigate(`/join-course/${encodeURIComponent(course.name)}`)}
                >
                  {course.isCurrent ? "View Course" : "Join Link"}
                </button>
                <button className="attachBtn" type="button" onClick={() => navigate("/assignments")}>
                  Open Assignments
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </StudentShell>
  );
};

export default Courses;
