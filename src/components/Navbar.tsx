import React from "react";
import "./Navbar.css";
import { MenuIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

type NavbarProps = {
    isMobile: boolean;
};

const Navbar: React.FC<NavbarProps> = ({ isMobile }) => {
  return (
    <div className={"navbarContainer"}>
        <div className="logo">
            <img className="logoImage" src="./gold-logo.png" />
            {!isMobile && <p className="logoText">Vouchr</p>}
        </div>
        {!isMobile ? 
            <ul className="navbarLinks" role="menubar">
                <li role="none" className="link">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        Collection
                    </NavLink>
                </li>
                <li role="none" className="link">
                    <NavLink to="/new" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        Add Ticket
                    </NavLink>
                </li>
                <li role="none" className="link">
                    <NavLink to="/settings" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        Settings
                    </NavLink>
                </li>
            </ul>
            /*
            <ul className="navbarLinks" role="menubar">
                <li className="link" role="none">
                    <NavLink to="/" end className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        Home
                    </NavLink>
                </li>
                <li className="link" role="none">
                    <NavLink to="/about" end className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        About
                    </NavLink>
                </li>
                <li className="link" role="none">
                    <NavLink to="/tickets" end className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        Tickets
                    </NavLink>
                </li>
                <li className="link" role="none">
                    <NavLink to="/settings" end className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        Settings
                    </NavLink>
                </li>
                <li className="link" role="none">
                    <NavLink to="/signout" end className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
                        Sign Out
                    </NavLink>
                </li>
            </ul>
            */
        : 
            <MenuIcon className="menuIcon" aria-label="Open menu" />
        }
        
    </div>
  );
};

export default Navbar;