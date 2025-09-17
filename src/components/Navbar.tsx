import "./Navbar.css";
import { MenuIcon } from 'lucide-react';
import { createSearchParams, NavLink } from 'react-router-dom';
import { SortType } from '../API';

type NavbarProps = {
    isMobile: boolean;
    sortType: SortType;
    onChangeSort: (s: SortType) => void;
    onSignOut?: () => void;
};

export default function Navbar({ isMobile, sortType, onChangeSort, onSignOut }: NavbarProps) {
    const qs = "?" + createSearchParams({ sort: sortType }).toString();
    return (
        <div className={"navbarContainer"}>
            <div className="logo">
                <img className="logoImage" src="../assets/gold-logo.png" />
                {!isMobile && <p className="logoText">Vouchr</p>}
            </div>
            {!isMobile ? 
                <ul className="navbarLinks" role="menubar">
                    <li role="none" className="link">
                        <NavLink to={{ pathname: "/", search: qs }} end 
                            className={({ isActive }) => (
                                isActive ? "navLink active" : "navLink"
                            )}>
                            Collection
                        </NavLink>
                    </li>
                    <li role="none" className="link">
                        <NavLink 
                            to={{ pathname: "/new", search: qs }} 
                            className={({ isActive }) => (
                                isActive ? "navLink active" : "navLink"
                            )}>
                            Add Ticket
                        </NavLink>
                    </li>
                    <li role="none" className="link">
                        <label className="navLink sortLabel" htmlFor="sortSel">Sort</label>
                        <select
                            id="sortSel"
                            value={sortType}
                            onChange={e => onChangeSort(e.target.value as SortType)}
                            className="sortSelect"
                        >
                            <option value={SortType.TIME_CREATED}>Newest</option>
                            <option value={SortType.EVENT_DATE}>Event Date</option>
                            <option value={SortType.ALPHABETICAL}>Title A–Z</option>
                        </select>
                    </li>
                    <li role="none" className="link">
                        <NavLink to={{ pathname: "/settings" }} 
                            className={({ isActive }) => (
                                isActive ? "navLink active" : "navLink"
                            )}>
                            Settings
                        </NavLink>
                    </li>
                    <li role="none" className="link">
                        <button 
                            type="button" 
                            className="navLink asButton" 
                            onClick={onSignOut}
                            disabled={!onSignOut}
                        >
                            Sign out
                        </button>
                    </li>
                </ul>
            : 
                <MenuIcon className="menuIcon" aria-label="Open menu" />
            }
            
        </div>
  );
}