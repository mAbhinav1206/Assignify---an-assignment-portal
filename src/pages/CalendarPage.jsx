import { useMemo } from "react";
import StudentShell from "../components/student/StudentShell";
import useStudentWorkspaceData from "../hooks/useStudentWorkspaceData";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const CalendarPage = () => {
  const { user, assignments, error, isLoading } = useStudentWorkspaceData();

  const groupedAssignments = useMemo(() => {
    const groups = new Map();

    assignments.forEach((assignment) => {
      const dateKey = formatDate(assignment.dueDate);
      const current = groups.get(dateKey) || [];
      current.push(assignment);
      groups.set(dateKey, current);
    });

    return Array.from(groups.entries());
  }, [assignments]);

  return (
    <StudentShell
      user={user}
      title="Calendar"
      intro="View your assignment deadlines grouped by date so nothing sneaks up on you."
    >
      {error && <p className="formError">{error}</p>}

      <section className="studentStack">
        {isLoading ? (
          <p className="emptyState">Loading calendar...</p>
        ) : groupedAssignments.length === 0 ? (
          <p className="emptyState">No upcoming deadlines in your calendar.</p>
        ) : (
          groupedAssignments.map(([date, items]) => (
            <div className="studentTimelineGroup" key={date}>
              <h3>{date}</h3>
              <div className="studentTimelineList">
                {items.map((assignment) => (
                  <article className="studentTimelineCard" key={assignment.id}>
                    <strong>{assignment.title}</strong>
                    <p>{assignment.course}</p>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </StudentShell>
  );
};

export default CalendarPage;
