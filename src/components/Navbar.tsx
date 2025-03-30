import React from "react";
import "./Navbar.css";

type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <div className="navbarContainer">
        <div className="logo">
            <img className="logoImage" src="./gold-logo.png" />
            <p className="logoText">Vouchr</p>
        </div>
        <ul className="navbarLinks">
            <li className="link"><a href="#">Home</a></li>
            <li className="link"><a href="#">About</a></li>
            <li className="link"><a href="#">Tickets</a></li>
            <li className="link"><a href="#">Settings</a></li>
        </ul>
    </div>
  );
};

export default Navbar;