import React, { useState, useEffect } from 'react';
import LeftSideBar from '../leftside/LeftSideBar';
import RightSideBar from '../rightside/RightSideBar';
import './dashboard.css';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeftDoubleIcon } from '@hugeicons/core-free-icons';
import { useSidebar } from '../../context/SideBarContext';
const Dashboard = () => {
  const [selectedLink, setSelectedLink] = useState('Dashboard');
  const { sidebarShow, toggleSidebar } = useSidebar();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 300);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 300);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={`dashboard ${sidebarShow && !isMobile ? 'collapsed' : ''}`}>
      <div className={`dashboard-left ${sidebarShow ? 'show' : ''}`}>
        <LeftSideBar
          selected={selectedLink}
          onSelect={setSelectedLink}
          collapsed={sidebarShow}
        />

        {!isMobile && (
          <div className="left-sidebar-filter" onClick={toggleSidebar}>
            <HugeiconsIcon
              icon={ArrowLeftDoubleIcon}
              size={20}
              color="#000000"
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      <div className="dashboard-right">
        <RightSideBar selected={selectedLink} />
      </div>
    </div>
  );
};

export default Dashboard;
