import { useRef, useState } from "react";
import { apiRequest } from "../../api";

const formatDueDate = (dueDate) => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return formatter.format(new Date(dueDate));
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file"));
    reader.readAsDataURL(file);
  });

const AssignmentList = ({ assignments, isLoading, onSubmitted }) => {
  const fileInputRefs = useRef({});
  const [files, setFiles] = useState({});
  const [progress, setProgress] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [deleting, setDeleting] = useState({});
  const [errors, setErrors] = useState({});

  const handleAttachClick = (assignmentId) => {
    fileInputRefs.current[assignmentId]?.click();
  };

  const handleFileChange = (e, assignmentId) => {
    const file = e.target.files[0];
    setFiles((currentFiles) => ({ ...currentFiles, [assignmentId]: file }));
    setErrors((currentErrors) => ({ ...currentErrors, [assignmentId]: "" }));
  };

  const runProgress = (assignmentId) =>
    new Promise((resolve) => {
      let percent = 0;

      const interval = setInterval(() => {
        percent += 20;

        setProgress((currentProgress) => ({
          ...currentProgress,
          [assignmentId]: percent
        }));

        if (percent >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 120);
    });

  const handleSubmit = async (assignmentId) => {
    const file = files[assignmentId];

    if (!file) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [assignmentId]: "Attach a file first"
      }));
      return;
    }

    setSubmitting((currentSubmitting) => ({ ...currentSubmitting, [assignmentId]: true }));
    setErrors((currentErrors) => ({ ...currentErrors, [assignmentId]: "" }));
    setProgress((currentProgress) => ({ ...currentProgress, [assignmentId]: 0 }));

    try {
      const fileData = await readFileAsDataUrl(file);
      await runProgress(assignmentId);
      await apiRequest(`/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify({ fileName: file.name, fileData })
      });
      await onSubmitted();
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [assignmentId]: error.message
      }));
    } finally {
      setSubmitting((currentSubmitting) => ({
        ...currentSubmitting,
        [assignmentId]: false
      }));
    }
  };

  const handleDelete = async (assignmentId) => {
    setDeleting((currentDeleting) => ({ ...currentDeleting, [assignmentId]: true }));
    setErrors((currentErrors) => ({ ...currentErrors, [assignmentId]: "" }));

    try {
      await apiRequest(`/assignments/${assignmentId}/submission/delete`, {
        method: "POST"
      });
      setFiles((currentFiles) => {
        const nextFiles = { ...currentFiles };
        delete nextFiles[assignmentId];
        return nextFiles;
      });
      setProgress((currentProgress) => {
        const nextProgress = { ...currentProgress };
        delete nextProgress[assignmentId];
        return nextProgress;
      });
      await onSubmitted();
    } catch (error) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [assignmentId]: error.message
      }));
    } finally {
      setDeleting((currentDeleting) => ({
        ...currentDeleting,
        [assignmentId]: false
      }));
    }
  };

  return (
    <div className="assignmentSection">

      <h2>Enrolled Assignments</h2>

      {isLoading && <p className="emptyState">Loading assignments...</p>}

      {!isLoading && assignments.length === 0 && (
        <p className="emptyState">No assignments are available yet.</p>
      )}

      {assignments.map((task) => {
        const attachedFile = files[task.id];
        const isSubmitted = Boolean(task.submission);
        const isSubmitting = Boolean(submitting[task.id]);
        const isDeleting = Boolean(deleting[task.id]);

        return (
          <div key={task.id} className="assignmentCard">

            <div className="assignmentInfo">
              <h4>{task.title}</h4>
              <p>{task.course}</p>
              <p>Due: {formatDueDate(task.dueDate)}</p>
              <p className={isSubmitted ? "statusSubmitted" : "statusPending"}>
                {isSubmitted ? (
                  <>
                    Submitted: {task.submission.fileName}
                    <button
                      className="deleteIconBtn"
                      type="button"
                      aria-label={`Delete submission for ${task.title}`}
                      title="Delete submission"
                      onClick={() => handleDelete(task.id)}
                      disabled={isSubmitting || isDeleting}
                    >
                      {isDeleting ? (
                        <span className="deleteSpinner" />
                      ) : (
                        <img src="/bin.png" alt="" />
                      )}
                    </button>
                  </>
                ) : (
                  "Pending submission"
                )}
              </p>

              {attachedFile && !isSubmitted && (
                <p className="fileName">
                  File: {attachedFile.name}
                </p>
              )}

              {progress[task.id] !== undefined && !isSubmitted && (
                <div className="progressBar">

                  <div
                    className="progressFill"
                    style={{ width: `${progress[task.id]}%` }}
                  />

                </div>
              )}

              {errors[task.id] && <p className="formError">{errors[task.id]}</p>}

            </div>

            <div className="assignmentButtons">

              <button
                className="attachBtn"
                type="button"
                onClick={() => handleAttachClick(task.id)}
                disabled={isSubmitting || isDeleting}
              >
                Attach
              </button>

              <button
                className="sbmtBtn"
                type="button"
                onClick={() => handleSubmit(task.id)}
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? "Submitting..." : isSubmitted ? "Resubmit" : "Submit"}
              </button>

              <input
                type="file"
                className="hiddenFileInput"
                ref={(el) => (fileInputRefs.current[task.id] = el)}
                onChange={(e) => handleFileChange(e, task.id)}
              />

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default AssignmentList;
