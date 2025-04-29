import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import "./navbar.css";
import avatar from "../../assets/a1.png";
import { useSidebar } from '../../context/SideBarContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { sidebarShow, toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const getFormattedDate = () => {
        const today = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('en-US', options);
    };

    const handleLogout = async () => {
        await logout();
        window.location.reload(); // Optional: refresh to reset state
    };

    return (
        <div className='navbar'>
            <div className='navbar-container'>
                <div className="navbar-date">
                    <div className={`mobile-filter ${sidebarShow ? 'show' : ''}`} onClick={toggleSidebar}>
                        <HugeiconsIcon icon={Menu01Icon} size={16} color="#000000" strokeWidth={1.5} />
                    </div>
                    <div className='navbar-date-title'>
                        <p>{getFormattedDate()}</p>
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="navbar-image" onClick={() => setDropdownOpen(!dropdownOpen)}>
                        <img src={avatar} alt="User" />
                        {dropdownOpen && (
                            <div className="navbar-dropdown">
                                <p onClick={handleLogout}>Logout</p>
                            </div>
                        )}
                    </div>
                    <div className="navbar-text">
                        <p>{user ? user.name : 'Guest'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
