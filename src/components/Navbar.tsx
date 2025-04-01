import React from "react";
import "./Navbar.css";
import { MenuIcon } from 'lucide-react';

type NavbarProps = {
    isMobile: boolean;
};

const Navbar: React.FC<NavbarProps> = ({ isMobile }) => {
  return (
    <div className={"navbarContainer " + (isMobile ? "navMobile" : "navDesktop")}>
        <div className="logo">
            <img className="logoImage" src="./gold-logo.png" />
            {!isMobile && <p className="logoText">Vouchr</p>}
        </div>
        {!isMobile ? 
            <ul className="navbarLinks">
                <li className="link"><a href="#">Home</a></li>
                <li className="link"><a href="#">About</a></li>
                <li className="link"><a href="#">Tickets</a></li>
                <li className="link"><a href="#">Settings</a></li>
            </ul> 
        : 
            <MenuIcon className="menuIcon" />
        }
        
    </div>
  );
};

export default Navbar;