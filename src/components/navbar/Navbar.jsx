import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon, ArrowUp01Icon, ArrowDown01Icon, Menu01Icon } from '@hugeicons/core-free-icons';
import "./navbar.css";
import avatar from "../../assets/a1.png";
import { useSidebar } from '../../context/SideBarContext';

const Navbar = () => {
    const { sidebarShow, toggleSidebar } = useSidebar();

    const user = JSON.parse(localStorage.getItem('user'));

    const getFormattedDate = () => {
        const today = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('en-US', options);
    };

  return (
    <div className='navbar'>
        <div className='navbar-container'>
        <div className="navbar-date">
        <div className={`mobile-filter ${sidebarShow ? 'show' : ''}`} onClick={toggleSidebar}>
        <HugeiconsIcon
      icon={Menu01Icon}
      size={16}
      color="#000000"
      strokeWidth={1.5}
    />
        </div>
        {/*<HugeiconsIcon icon={Calendar03Icon} color='#545454' size={16}  />*/}
            <div className='navbar-date-title'>
                <p>{getFormattedDate()}</p>
            </div>
            <div className='navbar-date-arrow'>
            {/*<HugeiconsIcon icon={ArrowUp01Icon}  color='#545454' size={16} />
            <HugeiconsIcon icon={ArrowDown01Icon}  color='#545454' size={16}   />*/}
            </div>
        </div>
        <div className="navbar-right">
            <div className="navbar-image">
                <img src={avatar} alt="" />
            </div>
            <div className="navbar-text">
                <p>{user ? user.name : 'Guest'}</p>
            </div>
        </div>
        </div>
    </div>
  )
}

export default Navbar;
