import { useEffect, useMemo, useState } from "react";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest, getStoredUser, saveSession } from "../api";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const TeacherStudents = () => {
  const [user, setUser] = useState(getStoredUser());
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const selectedCourseInfo = useMemo(
    () => courses.find((course) => course.name === selectedCourse),
    [courses, selectedCourse]
  );

  const joinLink = selectedCourse
    ? `${window.location.origin}/join-course/${encodeURIComponent(selectedCourse)}`
    : "";

  const loadCourses = async () => {
    const [meData, coursesData] = await Promise.all([apiRequest("/me"), apiRequest("/teacher/courses")]);
    saveSession(meData);
    setUser(meData.user);
    setCourses(coursesData.courses);
    return coursesData.courses;
  };

  const loadStudentsForCourse = async (courseName) => {
    if (!courseName) {
      setStudents([]);
      return;
    }

    const data = await apiRequest(`/teacher/courses/${encodeURIComponent(courseName)}/students`);
    setStudents(data.students);
  };

  useEffect(() => {
    const loadPage = async () => {
      setError("");
      setIsLoading(true);

      try {
        const loadedCourses = await loadCourses();
        const firstCourse = loadedCourses[0]?.name || "";
        setSelectedCourse(firstCourse);
        await loadStudentsForCourse(firstCourse);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, []);

  const handleCourseChange = async (event) => {
    const nextCourse = event.target.value;
    setSelectedCourse(nextCourse);
    setCopyMessage("");
    setError("");

    try {
      await loadStudentsForCourse(nextCourse);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopyMessage("Join link copied");
    } catch {
      setCopyMessage("Could not copy link");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    setRemovingId(studentId);
    setError("");

    try {
      await apiRequest(`/teacher/courses/${encodeURIComponent(selectedCourse)}/students/${studentId}`, {
        method: "DELETE",
      });
      await loadStudentsForCourse(selectedCourse);
      const refreshedCourses = await loadCourses();
      if (!refreshedCourses.some((course) => course.name === selectedCourse)) {
        const nextCourse = refreshedCourses[0]?.name || "";
        setSelectedCourse(nextCourse);
        await loadStudentsForCourse(nextCourse);
      }
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setRemovingId("");
    }
  };

  return (
    <TeacherShell
      user={user}
      title="Students"
      intro="View course enrollments, review course-specific submissions, and manage student access."
    >
      {error && <p className="formError">{error}</p>}

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Course Enrollments</h2>
            <p>Pick a course to see enrolled students and share a join link with new students.</p>
          </div>
        </div>

        <div className="teacherCourseToolbar">
          <label className="teacherSelectField">
            <span>Select course</span>
            <select value={selectedCourse} onChange={handleCourseChange} disabled={isLoading || courses.length === 0}>
              {courses.length === 0 ? (
                <option value="">No courses yet</option>
              ) : (
                courses.map((course) => (
                  <option key={course.name} value={course.name}>
                    {course.name}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="teacherJoinBox">
            <span>Student join link</span>
            <div className="teacherJoinRow">
              <input value={joinLink} readOnly placeholder="Select a course to generate a link" />
              <button className="viewBtn" type="button" onClick={handleCopyLink} disabled={!selectedCourse}>
                Copy Link
              </button>
            </div>
            {copyMessage && <p className="teacherCopyMessage">{copyMessage}</p>}
          </div>
        </div>

        {selectedCourseInfo && (
          <div className="teacherAssignmentMeta">
            <span>{selectedCourseInfo.enrolledCount} enrolled</span>
            <span>{selectedCourseInfo.name}</span>
          </div>
        )}
      </section>

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Enrolled Students</h2>
            <p>Each card shows a student’s submissions for the selected course.</p>
          </div>
        </div>

        {students.length === 0 ? (
          <p className="emptyState">No students are enrolled in this course yet.</p>
        ) : (
          <div className="teacherStudentsGrid">
            {students.map((student) => (
              <div className="teacherStudentCard" key={student.id}>
                <div className="teacherStudentHead">
                  <div className="teacherStudentAvatar">
                    {student.profile?.avatar ? (
                      <img src={student.profile.avatar} alt="" />
                    ) : (
                      <span>{(student.profile?.fullName || student.email)[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3>{student.profile?.fullName || student.email}</h3>
                    <p>{student.email}</p>
                  </div>
                </div>

                <div className="teacherStudentStats">
                  <span>{student.submissions.length} submissions</span>
                  <span>{selectedCourse}</span>
                </div>

                <div className="teacherSubmissionList">
                  {student.submissions.length === 0 ? (
                    <p className="emptyState">No submissions for this course yet.</p>
                  ) : (
                    student.submissions.map((submission) => (
                      <div className="teacherSubmissionItem" key={submission.id}>
                        <strong>{submission.assignmentTitle}</strong>
                        <p>{submission.fileName}</p>
                        <span>{formatDate(submission.submittedAt)}</span>
                      </div>
                    ))
                  )}
                </div>

                <button
                  className="teacherDeleteBtn teacherStudentRemoveBtn"
                  type="button"
                  disabled={removingId === student.id}
                  onClick={() => handleRemoveStudent(student.id)}
                >
                  {removingId === student.id ? "Removing..." : "Remove Student"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </TeacherShell>
  );
};

export default TeacherStudents;
