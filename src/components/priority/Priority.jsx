import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import "./priority.css";

const Priority = ({ color, bgColor, icon, title }) => {
    return (
      <div
        className="custom-grid-priority"
        style={{ color: color, backgroundColor: bgColor }}
      >
         <HugeiconsIcon color={color} icon={icon} size={16}/> 
        <p>
         {title}
        </p>
      </div>
    );
  };

export default Priority