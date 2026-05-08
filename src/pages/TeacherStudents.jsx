import { useEffect, useMemo, useState } from "react";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest, getStoredUser, saveSession } from "../api";

const formatSubjects = (subjects = []) => {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return "Not added yet";
  }

  return subjects.join(", ");
};

const TeacherStudents = () => {
  const [user, setUser] = useState(getStoredUser());
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const selectedCourseInfo = useMemo(
    () => courses.find((course) => course.name === selectedCourse),
    [courses, selectedCourse]
  );

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const loadCourses = async () => {
    const [meData, coursesData] = await Promise.all([apiRequest("/me"), apiRequest("/teacher/courses")]);
    saveSession(meData);
    setUser(meData.user);
    setCourses(coursesData.courses || []);
    return coursesData.courses || [];
  };

  const loadStudentsForCourse = async (courseName) => {
    if (!courseName) {
      setStudents([]);
      setSelectedStudentId("");
      return;
    }

    const data = await apiRequest(`/teacher/courses/${encodeURIComponent(courseName)}/students`);
    setStudents(data.students || []);
    setSelectedStudentId(data.students?.[0]?.id || "");
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

  const handleCourseSelect = async (courseName) => {
    setSelectedCourse(courseName);
    setCopyMessage("");
    setError("");

    try {
      await loadStudentsForCourse(courseName);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const handleCopyLink = async (courseName) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/join-course/${encodeURIComponent(courseName)}`
      );
      setCopyMessage(`Join link copied for ${courseName}`);
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
      await loadCourses();
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
      intro="Browse courses first, then open enrolled students and review the key details that matter."
    >
      {error && <p className="formError">{error}</p>}
      {copyMessage && <p className="teacherCopyMessage">{copyMessage}</p>}

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Courses</h2>
            <p>Open a course card to view enrolled students and share the join link when needed.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="emptyState">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="emptyState">No courses available yet.</p>
        ) : (
          <div className="teacherCourseGrid">
            {courses.map((course) => (
              <button
                className={`teacherCourseCard teacherCourseSelectCard ${
                  selectedCourse === course.name ? "teacherCourseCardActive" : ""
                }`}
                key={course.name}
                type="button"
                onClick={() => handleCourseSelect(course.name)}
              >
                <div className="teacherCourseCardTop">
                  <div className="teacherCourseIcon">
                    {course.thumbnail ? <img src={course.thumbnail} alt="" /> : null}
                  </div>

                  <div className="teacherCourseBody">
                    <div className="teacherCourseTitleRow">
                      <h3>{course.name}</h3>
                      <span className="studentBadge">{course.visibility}</span>
                    </div>
                    <p>{course.description}</p>
                  </div>
                </div>

                <div className="teacherAssignmentMeta">
                  <span>{course.enrolledCount} enrolled</span>
                  <span>{course.assignmentCount} assignments</span>
                </div>

                <div className="teacherCardActions">
                  <span className="teacherCourseOpenText">Open student list</span>
                  <button
                    className="viewBtn"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCopyLink(course.name);
                    }}
                  >
                    Copy Join Link
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedCourseInfo && (
        <section className="teacherPanel">
          <div className="teacherSectionHeader">
            <div>
              <h2>{selectedCourseInfo.name}</h2>
              <p>Click a student name to open their essential academic details.</p>
            </div>
          </div>

          <div className="teacherAssignmentMeta">
            <span>{selectedCourseInfo.enrolledCount} enrolled</span>
            <span>{selectedCourseInfo.assignmentCount} assignments</span>
          </div>

          {students.length === 0 ? (
            <p className="emptyState">No students are enrolled in this course yet.</p>
          ) : (
            <div className="teacherStudentExplorer">
              <div className="teacherStudentListPanel">
                <h3>Students</h3>
                <div className="teacherStudentList">
                  {students.map((student) => (
                    <button
                      className={`teacherStudentListItem ${
                        selectedStudentId === student.id ? "teacherStudentListItemActive" : ""
                      }`}
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <span className="teacherStudentListAvatar">
                        {student.profile?.avatar ? (
                          <img src={student.profile.avatar} alt="" />
                        ) : (
                          <span>{(student.profile?.fullName || student.profile?.username || "S")[0]}</span>
                        )}
                      </span>

                      <span className="teacherStudentListContent">
                        <strong>{student.profile?.fullName || student.profile?.username || "Student"}</strong>
                        <span>
                          {student.profile?.username ? `@${student.profile.username}` : "Student profile"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="teacherStudentDetailPanel">
                {selectedStudent ? (
                  <>
                    <div className="teacherStudentDetailHeader">
                      <div className="teacherStudentHead">
                        <div className="teacherStudentAvatar">
                          {selectedStudent.profile?.avatar ? (
                            <img src={selectedStudent.profile.avatar} alt="" />
                          ) : (
                            <span>
                              {(
                                selectedStudent.profile?.fullName ||
                                selectedStudent.profile?.username ||
                                "S"
                              )[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3>{selectedStudent.profile?.fullName || "Student"}</h3>
                          <p>@{selectedStudent.profile?.username || "username"}</p>
                        </div>
                      </div>

                      <button
                        className="teacherDeleteBtn"
                        type="button"
                        disabled={removingId === selectedStudent.id}
                        onClick={() => handleRemoveStudent(selectedStudent.id)}
                      >
                        {removingId === selectedStudent.id ? "Removing..." : "Remove Student"}
                      </button>
                    </div>

                    <div className="teacherStudentStats">
                      <span>{selectedStudent.submissions.length} submissions</span>
                      <span>{selectedCourseInfo.name}</span>
                    </div>

                    <div className="teacherStudentDetailsGrid">
                      <div className="teacherDetailItem">
                        <span>Institution</span>
                        <strong>{selectedStudent.profile?.institution || selectedStudent.profile?.university || "Not added"}</strong>
                      </div>
                      <div className="teacherDetailItem">
                        <span>Department</span>
                        <strong>{selectedStudent.profile?.department || selectedStudent.profile?.major || "Not added"}</strong>
                      </div>
                      <div className="teacherDetailItem">
                        <span>Course</span>
                        <strong>{selectedStudent.profile?.course || selectedCourseInfo.name}</strong>
                      </div>
                      <div className="teacherDetailItem">
                        <span>Year</span>
                        <strong>{selectedStudent.profile?.year || "Not added"}</strong>
                      </div>
                      <div className="teacherDetailItem teacherDetailItemWide">
                        <span>Subjects</span>
                        <strong>{formatSubjects(selectedStudent.profile?.subjects)}</strong>
                      </div>
                      <div className="teacherDetailItem teacherDetailItemWide">
                        <span>Favorite Subject</span>
                        <strong>{selectedStudent.profile?.favoriteSubject || "Not added"}</strong>
                      </div>
                    </div>

                    <div className="teacherSubmissionList">
                      {selectedStudent.submissions.length === 0 ? (
                        <p className="emptyState">No submissions for this course yet.</p>
                      ) : (
                        selectedStudent.submissions.map((submission) => (
                          <div className="teacherSubmissionItem" key={submission.id}>
                            <strong>{submission.assignmentTitle}</strong>
                            <p>{submission.fileName}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <p className="emptyState">Choose a student to view details.</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </TeacherShell>
  );
};

export default TeacherStudents;
