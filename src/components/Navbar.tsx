import "./Navbar.css";
import { MenuIcon } from 'lucide-react';
import { createSearchParams, NavLink, useLocation, matchPath } from 'react-router-dom';
import { SortType } from '../API';
import logoUrl from '../assets/gold-logo.png';

type NavbarProps = {
    isMobile: boolean;
    sortType: SortType;
    onChangeSort: (s: SortType) => void;
    onSignOut?: () => void;
};

export default function Navbar({ isMobile, sortType, onChangeSort, onSignOut }: NavbarProps) {
    const qs = "?" + createSearchParams({ sort: sortType }).toString();
    const { pathname } = useLocation();
    
    const HIDE_SORT_PATTERNS = [
        "/app/new",
        "/app/settings"
    ];

    const HIDE_ADD_PATTERNS = [
        "/app/settings"
    ];

    const hideSort = HIDE_SORT_PATTERNS.some(p =>
        matchPath({ path: p, end: true }, pathname) ||
        matchPath({ path: p, end: false }, pathname)
    );

    const hideAddTicket = HIDE_ADD_PATTERNS.some(p =>
        matchPath({ path: p, end: true }, pathname) ||
        matchPath({ path: p, end: false }, pathname)
    );

    return (
        <div className="navbarContainer">
            <div className="logo">
                <NavLink to={{ pathname: "/app/collection" }} end className="logoLink">
                    <img className="logoImage" src={logoUrl} alt="Vouchr logo" />
                    {!isMobile && <p className="logoText">Vouchr</p>}
                </NavLink>
            </div>
            {!isMobile ? 
                <ul className="navbarLinks" role="menubar">
                    <li role="none" className="link">
                        <NavLink to={{ pathname: "/app/collection", search: qs }} end 
                            className={({ isActive }) => (
                                isActive ? "navLink active" : "navLink"
                            )}>
                            Collection
                        </NavLink>
                    </li>
                    {!hideAddTicket && (
                        <li role="none" className="link">
                            <NavLink 
                                to={{ pathname: "/app/new" }} 
                                className={({ isActive }) => (
                                    isActive ? "navLink active" : "navLink"
                                )}>
                                Add Ticket
                            </NavLink>
                        </li>
                    )}
                    {!hideSort && (
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
                    )}
                    <li role="none" className="link">
                        <NavLink to={{ pathname: "/app/settings" }} 
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