import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import './leftnavlinks.css';

const LeftNavLinks = ({ icon, title, onClick, isSelected, collapsed }) => {
  return (
    <div
      className={`LeftNavLinks ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(e);
      }}
    >
      <div className='LeftNavLinks-icon'>
        <HugeiconsIcon icon={icon} color='#545454' size={16} />
      </div>
      <div className='LeftNavLinks-title'>
      {!collapsed && <p>{title}</p>}
      </div>
    </div>
  );
};

export default LeftNavLinks;
