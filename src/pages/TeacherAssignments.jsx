import { useState } from "react";
import TeacherShell from "../components/teacher/TeacherShell";
import { apiRequest } from "../api";
import useTeacherPageData from "../hooks/useTeacherPageData";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const TeacherAssignments = () => {
  const { user, data: assignmentData, error: loadError, reload } = useTeacherPageData(
    "/teacher/assignments",
    ""
  );
  const activeAssignments = assignmentData?.activeAssignments || [];
  const pastAssignments = assignmentData?.pastAssignments || [];
  const [form, setForm] = useState({
    title: "",
    course: "",
    dueDate: "",
    description: "",
    visibility: "public",
    submitFileType: "PDF",
  });
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const handleChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateAssignment = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title || !form.course || !form.dueDate) {
      setError("Title, course, and due date are required");
      return;
    }

    setIsCreating(true);

    try {
      await apiRequest("/teacher/assignments", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({
        title: "",
        course: "",
        dueDate: "",
        description: "",
        visibility: "public",
        submitFileType: "PDF",
      });
      await reload();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setDeletingId(assignmentId);
    setError("");

    try {
      await apiRequest(`/teacher/assignments/${assignmentId}`, {
        method: "DELETE",
      });
      await reload();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <TeacherShell
      user={user}
      title="Assignments"
      intro="Create, review, and remove assignments while tracking who has submitted work."
    >
      {(loadError || error) && <p className="formError">{loadError || error}</p>}

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Create Assignment</h2>
            <p>Publish new work for students and keep due dates organized.</p>
          </div>
        </div>

        <form className="teacherAssignmentForm" onSubmit={handleCreateAssignment}>
          <input
            name="title"
            placeholder="Assignment title"
            value={form.title}
            onChange={handleChange}
          />
          <input
            name="course"
            placeholder="Course"
            value={form.course}
            onChange={handleChange}
          />
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
          />
          <select name="visibility" value={form.visibility} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <select name="submitFileType" value={form.submitFileType} onChange={handleChange}>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="PPTX">PPTX</option>
            <option value="ZIP">ZIP</option>
            <option value="Image">Image</option>
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <button className="viewBtn teacherPrimaryBtn" type="submit" disabled={isCreating}>
            {isCreating ? "Posting..." : "Post Assignment"}
          </button>
        </form>
      </section>

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Assignment Progress</h2>
            <p>Review submissions and remove assignments that are no longer needed.</p>
          </div>
        </div>

        <div className="teacherAssignmentList">
          {activeAssignments.map((assignment) => (
            <div className="teacherAssignmentCard" key={assignment.id}>
              <div className="teacherAssignmentTop">
                <div>
                  <h3>{assignment.title}</h3>
                  <p>{assignment.course} • Due {formatDate(assignment.dueDate)}</p>
                </div>

                <button
                  className="teacherDeleteBtn"
                  type="button"
                  disabled={deletingId === assignment.id}
                  onClick={() => handleDeleteAssignment(assignment.id)}
                >
                  {deletingId === assignment.id ? "Deleting..." : "Delete Assignment"}
                </button>
              </div>

              <div className="teacherAssignmentMeta">
                <span>{assignment.submissionsCount} submitted</span>
                <span>{assignment.pendingCount} pending</span>
                <span>{assignment.visibility}</span>
                <span>{assignment.submitFileType}</span>
              </div>

              <div className="teacherSubmissionList">
                {assignment.students.length === 0 ? (
                  <p className="emptyState">No submissions yet.</p>
                ) : (
                  assignment.students.map((student) => (
                    <div className="teacherSubmissionItem" key={`${assignment.id}-${student.id}`}>
                      <strong>{student.name}</strong>
                      <p>{student.email}</p>
                      <span>{student.fileName}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="teacherPanel">
        <div className="teacherSectionHeader">
          <div>
            <h2>Past Assignment History</h2>
            <p>Expired assignments stay here for teacher records along with submitted files.</p>
          </div>
        </div>

        <div className="teacherAssignmentList">
          {pastAssignments.length === 0 ? (
            <p className="emptyState">No past assignments yet.</p>
          ) : (
            pastAssignments.map((assignment) => (
              <details className="teacherHistoryItem" key={assignment.id}>
                <summary className="teacherHistorySummary">
                  <div>
                    <strong>{assignment.title}</strong>
                    <p>{assignment.course} • Closed on {formatDate(assignment.dueDate)}</p>
                  </div>
                  <span>{assignment.students.length} submissions</span>
                </summary>

                <div className="teacherSubmissionList">
                  {assignment.students.length === 0 ? (
                    <p className="emptyState">No submissions were recorded.</p>
                  ) : (
                    assignment.students.map((student) => (
                      <div className="teacherSubmissionItem" key={`${assignment.id}-${student.id}`}>
                        <strong>{student.name}</strong>
                        <p>{student.email}</p>
                        <span>{student.fileName}</span>
                      </div>
                    ))
                  )}
                </div>
              </details>
            ))
          )}
        </div>
      </section>
    </TeacherShell>
  );
};

export default TeacherAssignments;
