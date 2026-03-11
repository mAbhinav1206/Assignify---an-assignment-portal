import React from "react";

const StatsCards = () => {

  const stats = [
    { title: "Courses Enrolled", value: 5, icon: "📚" },
    { title: "Pending Assignments", value: 3, icon: "📝" },
    { title: "Due This Week", value: 2, icon: "⏳" },
    { title: "Completion Rate", value: "78%", icon: "📈" }
  ];

  return (

    <div className="statsGrid">

      {stats.map((item, index) => (
        <div key={index} className="statCard">

          <div className="statIcon">{item.icon}</div>

          <div className="statInfo">
            <h3>{item.value}</h3>
            <p>{item.title}</p>
          </div>

        </div>
      ))}

    </div>

  );
};

export default StatsCards;