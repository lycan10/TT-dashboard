import React from "react";
import "./overviewcard.css";

const OverviewCard = ({ title, tasks, foregroundColor, backgroundColor }) => {
  return (
    <div className="overview-card">
      <div className="overview-card-report">
        <p style={{ backgroundColor: backgroundColor, color: foregroundColor }}>
          {title}
        </p>
        <h6>Turnaround Time</h6>
      </div>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            <div className="overview-card-name">
              <p>{task.customerName}&nbsp;&nbsp;</p>
              <p>-</p>
              <p>{task.days}</p>
              <p>Days</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OverviewCard;
