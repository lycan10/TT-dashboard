import React, { useEffect, useState } from 'react';
import "./leftsidebar.css";
import LeftNavLinks from '../../components/leftNavLinks/LeftNavLinks';
import logo from "../../assets/black-icon.png";
import { Task02Icon, Home02Icon } from '@hugeicons/core-free-icons';
import { useSidebar } from '../../context/SideBarContext';

const LeftSideBar = ({ selected, onSelect, collapsed }) => {
  const { toggleSidebar } = useSidebar();
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

  const handleLinkClick = (linkTitle) => {
    onSelect(linkTitle);
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <div className={`leftSideBar ${collapsed ? 'collapsed' : ''}`}>
      <div className="leftSideBar-container">
        <div className="leftSideBar-logo-container">
          <div className="leftSideBar-logo">
            <img src={logo || "https://placehold.co/25x25/000000/FFFFFF?text=Logo"} alt="Logo" />
          </div>
          {!collapsed && (
            <div className="leftSideBar-title">
              <h1>Total Trailer</h1>
            </div>
          )}
        </div>

        <LeftNavLinks
          icon={Home02Icon}
          title="Dashboard"
          onClick={() => handleLinkClick('Dashboard')}
          isSelected={selected === 'Dashboard'}
          collapsed={collapsed}
        />
        <LeftNavLinks
          icon={Task02Icon}
          title="Order"
          onClick={() => handleLinkClick('Order')}
          isSelected={selected === 'Order'}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
};

export default LeftSideBar;
