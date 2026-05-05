import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest } from "../api";
import useTeacherPageData from "../hooks/useTeacherPageData";

const getNextSevenDays = () => {
  const days = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let index = 0; index < 7; index += 1) {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + index);
    days.push(nextDate);
  }

  return days;
};

const formatShortDay = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
  }).format(date);

const buildLinePoints = (values, width, height, padding) => {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const maxValue = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : padding + (index / (values.length - 1)) * innerWidth;
      const y = padding + innerHeight - (value / maxValue) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
};

const TeacherAnalytics = () => {
  const navigate = useNavigate();
  const { user, data: stats, error, isLoading } = useTeacherPageData("/teacher/overview", "stats");
  const [courses, setCourses] = useState([]);
  const [assignmentSnapshot, setAssignmentSnapshot] = useState({
    activeAssignments: [],
    pastAssignments: [],
  });
  const [chartError, setChartError] = useState("");

  useEffect(() => {
    const loadCharts = async () => {
      setChartError("");

      try {
        const [coursesData, assignmentsData] = await Promise.all([
          apiRequest("/teacher/courses"),
          apiRequest("/teacher/assignments"),
        ]);

        setCourses(coursesData.courses || []);
        setAssignmentSnapshot({
          activeAssignments: assignmentsData.activeAssignments || [],
          pastAssignments: assignmentsData.pastAssignments || [],
        });
      } catch (loadChartError) {
        setChartError(loadChartError.message);
      }
    };

    loadCharts();
  }, []);

  const statCards = [
    { label: "Students", value: stats?.totalStudents ?? 0 },
    { label: "Active Assignments", value: stats?.activeAssignments ?? 0 },
    { label: "Submissions", value: stats?.totalSubmissions ?? 0 },
    { label: "Average Completion", value: `${stats?.averageCompletion ?? 0}%` },
  ];

  const quickActions = [
    {
      title: "Build the course catalog",
      description: "Polish descriptions, thumbnails, and join visibility before students arrive.",
      path: "/teacher/courses",
      action: "Open Courses",
    },
    {
      title: "Review enrolled students",
      description: "Check who joined each course and remove access when needed.",
      path: "/teacher/students",
      action: "Open Students",
    },
    {
      title: "Post fresh work",
      description: "Create assignments with deadlines, submission types, and visibility rules.",
      path: "/teacher/assignments",
      action: "Open Assignments",
    },
  ];

  const enrollmentBars = useMemo(() => {
    const sortedCourses = [...courses].sort((firstCourse, secondCourse) => {
      if (secondCourse.enrolledCount !== firstCourse.enrolledCount) {
        return secondCourse.enrolledCount - firstCourse.enrolledCount;
      }

      return firstCourse.name.localeCompare(secondCourse.name);
    });

    const maxEnrolled = Math.max(...sortedCourses.map((course) => course.enrolledCount), 1);

    return sortedCourses.slice(0, 6).map((course) => ({
      ...course,
      width: `${(course.enrolledCount / maxEnrolled) * 100}%`,
    }));
  }, [courses]);

  const progressBars = useMemo(() => {
    const assignments = assignmentSnapshot.activeAssignments || [];

    return assignments.slice(0, 6).map((assignment) => {
      const total = assignment.submissionsCount + assignment.pendingCount;
      const completion = total === 0 ? 0 : Math.round((assignment.submissionsCount / total) * 100);

      return {
        id: assignment.id,
        title: assignment.title,
        course: assignment.course,
        completion,
        submitted: assignment.submissionsCount,
        pending: assignment.pendingCount,
      };
    });
  }, [assignmentSnapshot]);

  const weeklyLoad = useMemo(() => {
    const buckets = getNextSevenDays().map((date) => ({
      key: date.toDateString(),
      label: formatShortDay(date),
      value: 0,
    }));

    (assignmentSnapshot.activeAssignments || []).forEach((assignment) => {
      const dueDate = new Date(assignment.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const bucket = buckets.find((item) => item.key === dueDate.toDateString());

      if (bucket) {
        bucket.value += 1;
      }
    });

    return buckets;
  }, [assignmentSnapshot]);

  const linePoints = useMemo(
    () => buildLinePoints(weeklyLoad.map((item) => item.value), 460, 180, 18),
    [weeklyLoad]
  );

  const maxWeekLoad = Math.max(...weeklyLoad.map((item) => item.value), 0);

  return (
    <TeacherShell
      user={user}
      title="Teacher Workspace"
      intro="Keep courses, assignment flow, and submission momentum in one place."
    >
      {(error || chartError) && <p className="formError">{error || chartError}</p>}

      <section className="teacherStatsGrid">
        {statCards.map((card) => (
          <article className="teacherStatCard" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="teacherAnalyticsGrid">
        <article className="teacherPanel teacherChartPanel">
          <div className="teacherSectionHeader">
            <div>
              <h2>Enrollment by Course</h2>
              <p>See which classes are drawing the most students right now.</p>
            </div>
          </div>

          <div className="teacherChartList">
            {enrollmentBars.length === 0 ? (
              <p className="emptyState">No course enrollments yet.</p>
            ) : (
              enrollmentBars.map((course) => (
                <div className="teacherChartRow" key={course.name}>
                  <div className="teacherChartRowTop">
                    <strong>{course.name}</strong>
                    <span>{course.enrolledCount}</span>
                  </div>
                  <div className="teacherChartTrack">
                    <div className="teacherChartFill" style={{ width: course.width }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="teacherPanel teacherChartPanel">
          <div className="teacherSectionHeader">
            <div>
              <h2>Assignment Completion</h2>
              <p>Track which active tasks are already moving and which ones need attention.</p>
            </div>
          </div>

          <div className="teacherChartList">
            {progressBars.length === 0 ? (
              <p className="emptyState">No active assignments to measure yet.</p>
            ) : (
              progressBars.map((assignment) => (
                <div className="teacherChartRow" key={assignment.id}>
                  <div className="teacherChartRowTop">
                    <strong>{assignment.title}</strong>
                    <span>{assignment.completion}%</span>
                  </div>
                  <p className="teacherChartMeta">
                    {assignment.course} • {assignment.submitted} submitted • {assignment.pending} pending
                  </p>
                  <div className="teacherChartTrack teacherChartTrackSuccess">
                    <div
                      className="teacherChartFill teacherChartFillSuccess"
                      style={{ width: `${assignment.completion}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="teacherPanel teacherChartPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>7-Day Assignment Load</h2>
            <p>Spot deadline clusters before the week gets crowded.</p>
          </div>
          <div className="teacherAssignmentMeta">
            <span>{maxWeekLoad} max on a day</span>
            <span>{assignmentSnapshot.pastAssignments.length} archived</span>
          </div>
        </div>

        <div className="teacherLineChartCard">
          <svg
            className="teacherLineChart"
            viewBox="0 0 460 180"
            role="img"
            aria-label="Assignments due over the next seven days"
          >
            <polyline className="teacherLineChartStroke" fill="none" points={linePoints} />
            {weeklyLoad.map((item, index) => {
              const points = buildLinePoints(weeklyLoad.map((entry) => entry.value), 460, 180, 18).split(" ");
              const [cx, cy] = points[index].split(",");

              return (
                <circle
                  key={item.key}
                  className="teacherLineChartPoint"
                  cx={cx}
                  cy={cy}
                  r="4"
                />
              );
            })}
          </svg>

          <div className="teacherLineChartLabels">
            {weeklyLoad.map((item) => (
              <div className="teacherLineChartLabel" key={item.key}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Quick Actions</h2>
            <p>Jump straight into the tasks that keep the portal moving for your class.</p>
          </div>
        </div>

        <div className="teacherCourseGrid">
          {quickActions.map((item) => (
            <article className="teacherCourseCard" key={item.title}>
              <div className="teacherCourseBody">
                <div className="teacherCourseTitleRow">
                  <h3>{item.title}</h3>
                </div>
                <p>{item.description}</p>
              </div>

              <div className="teacherCardActions">
                <button className="viewBtn" type="button" onClick={() => navigate(item.path)}>
                  {item.action}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isLoading && <p className="emptyState">Loading analytics...</p>}
    </TeacherShell>
  );
};

export default TeacherAnalytics;
