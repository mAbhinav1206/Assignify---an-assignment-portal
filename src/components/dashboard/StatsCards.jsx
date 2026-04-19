const StatsCards = ({ stats, isLoading }) => {
  const items = [
    { title: "Courses Enrolled", value: stats?.coursesEnrolled ?? 0, icon: "/curriculum.png" },
    { title: "Pending Assignments", value: stats?.pendingAssignments ?? 0, icon: "/pendingTasks.png" },
    { title: "Due This Week", value: stats?.dueThisWeek ?? 0, icon: "/clock.png" },
    { title: "Completion Rate", value: `${stats?.completionRate ?? 0}%`, icon: "/done.png" }
  ];

  return (

    <div className="statsGrid">

      {items.map((item) => (
        <div key={item.title} className="statCard">

          <div className="statIcon">
            {item.icon.endsWith(".png") ? <img src={item.icon} alt="" /> : item.icon}
          </div>

          <div className="statInfo">
            <h3>{isLoading ? "..." : item.value}</h3>
            <p>{item.title}</p>
          </div>

        </div>
      ))}

    </div>

  );
};

export default StatsCards;
