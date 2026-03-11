import React, { useRef, useState } from "react";

const AssignmentList = () => {

  const fileInputRefs = useRef([]);

  const assignments = [
    { title: "Math Homework", due: "Tomorrow" },
    { title: "Physics Lab Report", due: "Friday" },
    { title: "Computer Science Project", due: "2 Days" }
  ];

  const [files, setFiles] = useState({});
  const [progress, setProgress] = useState({});

  const handleAttachClick = (index) => {
    fileInputRefs.current[index].click();
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    setFiles({ ...files, [index]: file });
  };

  const handleSubmit = (index) => {

    const file = files[index];

    if (!file) {
      alert("Attach a file first");
      return;
    }

    let percent = 0;

    const interval = setInterval(() => {
      percent += 10;

      setProgress(prev => ({
        ...prev,
        [index]: percent
      }));

      if (percent >= 100) {
        clearInterval(interval);
      }

    }, 200);

  };

  return (
    <div className="assignmentSection">

      <h2>Enrolled Assignments</h2>

      {assignments.map((task, index) => (

        <div key={index} className="assignmentCard">

          <div className="assignmentInfo">
            <h4>{task.title}</h4>
            <p>Due: {task.due}</p>

            {files[index] && (
              <p className="fileName">
                📄 {files[index].name}
              </p>
            )}

            {progress[index] && (
              <div className="progressBar">

                <div
                  className="progressFill"
                  style={{ width: progress[index] + "%" }}
                />

              </div>
            )}

          </div>

          <div className="assignmentButtons">

            <button
              className="attachBtn"
              onClick={() => handleAttachClick(index)}
            >
              📎 Attach
            </button>

            <button
              className="sbmtBtn"
              onClick={() => handleSubmit(index)}
            >
              Submit
            </button>

            <input
              type="file"
              style={{ display: "none" }}
              ref={(el) => (fileInputRefs.current[index] = el)}
              onChange={(e) => handleFileChange(e, index)}
            />

          </div>

        </div>

      ))}

    </div>
  );
};

export default AssignmentList;