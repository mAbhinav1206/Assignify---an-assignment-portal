import { useMemo, useState } from "react";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest } from "../api";
import useTeacherPageData from "../hooks/useTeacherPageData";

const emptyForm = {
  name: "",
  description: "",
  thumbnail: "/curriculum.png",
  visibility: "public",
};

const TeacherCourses = () => {
  const { user, data: courses = [], error: loadError, reload } = useTeacherPageData(
    "/teacher/courses",
    "courses"
  );
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const totalStudents = useMemo(
    () => courses.reduce((sum, course) => sum + course.enrolledCount, 0),
    [courses]
  );

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEditCourse = (course) => {
    setCopyMessage("");
    setError("");
    setForm({
      name: course.name,
      description: course.description || "",
      thumbnail: course.thumbnail || "/curriculum.png",
      visibility: course.visibility || "public",
    });
  };

  const handleSaveCourse = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Course name is required");
      return;
    }

    setIsSaving(true);

    try {
      await apiRequest("/teacher/courses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await reload();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyJoinLink = async (courseName) => {
    const joinLink = `${window.location.origin}/join-course/${encodeURIComponent(courseName)}`;

    try {
      await navigator.clipboard.writeText(joinLink);
      setCopyMessage(`Join link copied for ${courseName}`);
    } catch {
      setCopyMessage("Could not copy the join link");
    }
  };

  return (
    <TeacherShell
      user={user}
      title="Courses"
      intro="Shape the course catalog students see before they enroll and keep join links organized."
    >
      {(loadError || error) && <p className="formError">{loadError || error}</p>}
      {copyMessage && <p className="teacherCopyMessage">{copyMessage}</p>}

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Course Setup</h2>
            <p>Create a course card, write a short description, and control who can join it.</p>
          </div>
        </div>

        <form className="teacherAssignmentForm" onSubmit={handleSaveCourse}>
          <input
            name="name"
            placeholder="Course name"
            value={form.name}
            onChange={handleChange}
          />
          <select name="visibility" value={form.visibility} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <input
            name="thumbnail"
            placeholder="Thumbnail path"
            value={form.thumbnail}
            onChange={handleChange}
          />
          <div className="teacherCourseHint">Use a public asset path like `/curriculum.png`.</div>
          <textarea
            name="description"
            placeholder="Short course description"
            value={form.description}
            onChange={handleChange}
          />
          <button className="viewBtn teacherPrimaryBtn" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Course"}
          </button>
        </form>
      </section>

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Published Courses</h2>
            <p>Keep the course catalog polished, share join links, and jump back in to edit anytime.</p>
          </div>
        </div>

        <div className="teacherAssignmentMeta">
          <span>{courses.length} courses</span>
          <span>{totalStudents} total enrollments</span>
        </div>

        {courses.length === 0 ? (
          <p className="emptyState">No courses yet. Create one to get started.</p>
        ) : (
          <div className="teacherCourseGrid">
            {courses.map((course) => (
              <article className="teacherCourseCard" key={course.name}>
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
                  <button className="viewBtn" type="button" onClick={() => handleEditCourse(course)}>
                    Edit
                  </button>
                  <button className="attachBtn" type="button" onClick={() => handleCopyJoinLink(course.name)}>
                    Copy Join Link
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </TeacherShell>
  );
};

export default TeacherCourses;
