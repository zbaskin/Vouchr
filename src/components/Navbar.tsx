import "./Navbar.css";
import { useEffect, useState, useCallback } from "react";
import {
  createSearchParams,
  NavLink,
  useLocation,
  matchPath,
} from "react-router-dom";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  Plus as PlusIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import { SortType } from "../API";
import logoUrlGold from "../assets/gold-logo.png";
import logoUrlRed from "../assets/red-logo.png";

type NavbarProps = {
  isMobile: boolean;
  sortType: SortType;
  onChangeSort: (s: SortType) => void;
  onSignOut?: () => void;
};

export default function Navbar({
  isMobile,
  sortType,
  onChangeSort,
  onSignOut,
}: NavbarProps) {
  const qs = "?" + createSearchParams({ sort: sortType }).toString();
  const { pathname } = useLocation();

  const HIDE_SORT_PATTERNS = ["/app/new", "/app/settings"];
  const HIDE_ADD_PATTERNS = ["/app/settings"];

  const hideSort = HIDE_SORT_PATTERNS.some(
    (p) =>
      matchPath({ path: p, end: true }, pathname) ||
      matchPath({ path: p, end: false }, pathname)
  );

  const hideAddTicket = HIDE_ADD_PATTERNS.some(
    (p) =>
      matchPath({ path: p, end: true }, pathname) ||
      matchPath({ path: p, end: false }, pathname)
  );

  // Mobile menu state
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Prevent body scroll when the mobile sheet is open
  useEffect(() => {
    const { style } = document.body;
    const prev = style.overflow;
    if (open) style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="navbarContainer">
      <div className="logo">
        <NavLink to={{ pathname: "/app/collection" }} end className="logoLink">
          <img className="logoImage" src={logoUrlGold} alt="Vouchr logo" />
          {!isMobile && <p className="logoText">Vouchr</p>}
        </NavLink>
      </div>

      {/* Desktop */}
      {!isMobile ? (
        <ul className="navbarLinks" role="menubar">
          <li role="none" className="link">
            <NavLink
              to={{ pathname: "/app/collection", search: qs }}
              end
              className={({ isActive }) =>
                isActive ? "navLink active" : "navLink"
              }
            >
              Collection
            </NavLink>
          </li>

          {!hideAddTicket && (
            <li role="none" className="link">
              <NavLink
                to={{ pathname: "/app/new" }}
                className={({ isActive }) =>
                  isActive ? "navLink active" : "navLink"
                }
              >
                Add Ticket
              </NavLink>
            </li>
          )}

          {!hideSort && (
            <li role="none" className="link sortGroup">
              <label className="navLink sortLabel" htmlFor="sortSel">
                Sort
              </label>
              <select
                id="sortSel"
                value={sortType}
                onChange={(e) => onChangeSort(e.target.value as SortType)}
                className="sortSelect"
              >
                <option value={SortType.TIME_CREATED}>Newest</option>
                <option value={SortType.EVENT_DATE}>Event Date</option>
                <option value={SortType.ALPHABETICAL}>Title A–Z</option>
              </select>
            </li>
          )}

          <li role="none" className="link">
            <NavLink
              to={{ pathname: "/app/settings" }}
              className={({ isActive }) =>
                isActive ? "navLink active" : "navLink"
              }
            >
              Settings
            </NavLink>
          </li>
          <li role="none" className="link">
            <button
              type="button"
              className="navLink asButton signOutButton"
              onClick={onSignOut}
              disabled={!onSignOut}
            >
              Sign out
            </button>
          </li>
        </ul>
      ) : (
        // Mobile
        <>
          <button
            type="button"
            className="iconButton"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={toggle}
          >
            {open ? (
              <CloseIcon className="menuIcon red" />
            ) : (
              <MenuIcon className="menuIcon gold" />
            )}
          </button>

          {open && (
            <div
              className="mobileMenuBackdrop"
              onClick={close}
              role="presentation"
            >
              <div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                className="mobileMenuPanel"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mobileHeader">
                  <img className="mobileLogo" src={logoUrlRed} alt="" />
                  <button
                    className="iconButton"
                    aria-label="Close menu"
                    onClick={close}
                  >
                    <CloseIcon className="menuIcon" />
                  </button>
                </div>

                <ul className="mobileList">
                  <li>
                    <NavLink
                      to={{ pathname: "/app/collection", search: qs }}
                      end
                      className="mobileLink"
                      onClick={close}
                    >
                      Collection
                    </NavLink>
                  </li>

                  {!hideAddTicket && (
                    <li>
                      <NavLink
                        to={{ pathname: "/app/new" }}
                        className="mobileLink"
                        onClick={close}
                      >
                        <PlusIcon className="mobileIcon" /> Add Ticket
                      </NavLink>
                    </li>
                  )}

                  {!hideSort && (
                    <li className="mobileSelectRow">
                      <label htmlFor="m-sortSel" className="mobileSelectLabel">
                        Sort by
                      </label>
                      <select
                        id="m-sortSel"
                        className="mobileSelect"
                        value={sortType}
                        onChange={(e) =>
                          onChangeSort(e.target.value as SortType)
                        }
                      >
                        <option value={SortType.TIME_CREATED}>Newest</option>
                        <option value={SortType.EVENT_DATE}>Event Date</option>
                        <option value={SortType.ALPHABETICAL}>Title A–Z</option>
                      </select>
                    </li>
                  )}

                  <li>
                    <NavLink
                      to={{ pathname: "/app/settings" }}
                      className="mobileLink"
                      onClick={close}
                    >
                      <SettingsIcon className="mobileIcon" /> Settings
                    </NavLink>
                  </li>
                </ul>

                <div className="mobileFooter">
                  <button
                    type="button"
                    className="mobileLink asButton"
                    onClick={() => {
                      close();
                      onSignOut?.();
                    }}
                  >
                    <LogOutIcon className="mobileIcon" /> Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
