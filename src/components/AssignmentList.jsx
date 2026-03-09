import React from "react";

function AssignmentList() {
  const assignments = [
    { id: 1, title: "Math Assignment", due: "Tomorrow" },
    { id: 2, title: "Physics Lab Report", due: "Friday" },
  ];

  return (
    <div className="assignmentList">
      <h2>Upcoming Assignments</h2>

      {assignments.map((item) => (
        <div key={item.id} className="assignmentCard">
          <h3>{item.title}</h3>
          <p>Due: {item.due}</p>
        </div>
      ))}
    </div>
  );
}

export default AssignmentList;