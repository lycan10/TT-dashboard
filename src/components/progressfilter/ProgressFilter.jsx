import React from 'react';
import "./progressfilter.css";

const ProgressFilter = ({title, count, bgColor, color}) => {
  return (
    <div className='progressfilter' style={{backgroundColor: bgColor}}>
        <div className="progressfilter-text-container">
       
        <div className='progressfilter-text'>
            <p style={{color: color}}>{title}</p>
        </div>
        </div>
       
        <div className='progressfilter-count'>
            <p>{count}</p>
        </div>
    </div>
  )
}

export default ProgressFilter