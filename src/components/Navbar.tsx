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
  ticketCount?: number;
};

export default function Navbar({
  isMobile,
  sortType,
  onChangeSort,
  onSignOut,
  ticketCount = 0,
}: NavbarProps) {
  const qs = "?" + createSearchParams({ sort: sortType }).toString();
  const { pathname } = useLocation();

  const HIDE_SORT_PATTERNS = ["/app/new", "/app/settings"];
  const HIDE_ADD_PATTERNS = ["/app/settings"];

  const hideSort = ticketCount === 0 || HIDE_SORT_PATTERNS.some(
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
    if (!open) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
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
    // navbarContainer: full-bleed, centered content, bg-primary, min-h-16
    <div className="bg-primary min-h-16 flex items-center justify-between w-full px-5 lg:px-[calc((100vw-1000px)/2)]">
      {/* logo */}
      <div className="flex items-center gap-2.5 select-none">
        <NavLink to={{ pathname: "/app/collection" }} end className="inline-flex items-center gap-3 no-underline">
          <img className="h-12 w-auto max-[767px]:h-10" src={logoUrlGold} alt="Vouchr logo" />
          {!isMobile && (
            <p className="font-['Arista'] text-secondary-content text-[2rem] m-0">Vouchr</p>
          )}
        </NavLink>
      </div>

      {/* Desktop */}
      {!isMobile ? (
        <ul className="list-none m-0 p-0 inline-flex items-center gap-1.5" role="menubar">
          <li role="none" className="inline-flex items-center">
            <NavLink
              to={{ pathname: "/app/collection", search: qs }}
              end
              className={({ isActive }) =>
                "inline-flex items-center gap-2 px-3 py-2 no-underline text-[0.95rem] font-semibold text-secondary-content hover:underline focus:underline" +
                (isActive ? " underline" : "")
              }
            >
              Collection
            </NavLink>
          </li>

          {!hideAddTicket && (
            <li role="none" className="inline-flex items-center">
              <NavLink
                to={{ pathname: "/app/new" }}
                className={({ isActive }) =>
                  "inline-flex items-center gap-2 px-3 py-2 no-underline text-[0.95rem] font-semibold text-secondary-content hover:underline focus:underline" +
                  (isActive ? " underline" : "")
                }
              >
                Add Ticket
              </NavLink>
            </li>
          )}

          {!hideSort && (
            <li role="none" className="inline-flex items-center relative">
              {/* sortLabel: navLink style + ::after arrow indicator */}
              <label
                className="inline-flex items-center gap-2 px-3 py-2 text-[0.95rem] font-semibold text-secondary-content cursor-pointer after:content-['_▾'] after:text-[0.85em] after:opacity-90"
                htmlFor="sortSel"
              >
                Sort
              </label>
              {/* sortSelect: invisible overlay over the label */}
              <select
                id="sortSel"
                value={sortType}
                onChange={(e) => onChangeSort(e.target.value as SortType)}
                className="absolute inset-0 w-full h-full opacity-0 appearance-none border-0 bg-transparent cursor-pointer z-1"
              >
                <option value={SortType.TIME_CREATED}>Newest</option>
                <option value={SortType.EVENT_DATE}>Event Date</option>
                <option value={SortType.ALPHABETICAL}>Title A–Z</option>
              </select>
            </li>
          )}

          <li role="none" className="inline-flex items-center">
            <NavLink
              to={{ pathname: "/app/settings" }}
              className={({ isActive }) =>
                "inline-flex items-center gap-2 px-3 py-2 no-underline text-[0.95rem] font-semibold text-secondary-content hover:underline focus:underline" +
                (isActive ? " underline" : "")
              }
            >
              Settings
            </NavLink>
          </li>
          <li role="none" className="inline-flex items-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 text-[0.95rem] font-semibold! text-secondary-content bg-transparent border-0 cursor-pointer hover:underline focus:underline"
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
            className="border-0 bg-transparent p-1.5 cursor-pointer"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={toggle}
          >
            {open ? (
              <CloseIcon className="h-7 w-7 text-secondary-content" />
            ) : (
              <MenuIcon className="h-7 w-7 text-secondary-content" />
            )}
          </button>

          {open && (
            <div
              className="fixed inset-0 bg-black/42 z-50 flex justify-end"
              onClick={close}
              role="presentation"
              data-testid="mobile-menu-overlay"
            >
              <div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                className="h-dvh w-[min(88vw,360px)] bg-background text-primary p-3.5 shadow-[-8px_0_24px_rgba(0,0,0,0.35)] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-2 px-1 py-1 pb-2.5 border-b border-border">
                  <img className="h-7 w-auto" src={logoUrlRed} alt="" />
                  <button
                    className="border-0 bg-transparent p-1.5 cursor-pointer"
                    aria-label="Close menu"
                    onClick={close}
                  >
                    <CloseIcon className="h-7 w-7" />
                  </button>
                </div>

                <ul className="list-none py-3 px-0 m-0 grid gap-1.5">
                  <li>
                    <NavLink
                      to={{ pathname: "/app/collection", search: qs }}
                      end
                      className="inline-flex items-center gap-2.5 w-full px-2 py-2.5 no-underline text-inherit font-semibold rounded-lg hover:bg-white/8 focus:bg-white/8"
                      onClick={close}
                    >
                      Collection
                    </NavLink>
                  </li>

                  {!hideAddTicket && (
                    <li>
                      <NavLink
                        to={{ pathname: "/app/new" }}
                        className="inline-flex items-center gap-2.5 w-full px-2 py-2.5 no-underline text-inherit font-semibold rounded-lg hover:bg-white/8 focus:bg-white/8"
                        onClick={close}
                      >
                        <PlusIcon className="h-4.5 w-4.5" /> Add Ticket
                      </NavLink>
                    </li>
                  )}

                  {!hideSort && (
                    <li className="grid grid-cols-1 gap-1.5 py-1.5 px-0.5">
                      <label htmlFor="m-sortSel" className="text-[0.85rem] opacity-90">
                        Sort by
                      </label>
                      <select
                        id="m-sortSel"
                        className="w-full h-11 rounded-[10px] px-3 border border-border bg-(--surface,#111) text-inherit"
                        value={sortType}
                        onChange={(e) => {
                          onChangeSort(e.target.value as SortType);
                          close();
                        }}
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
                      className="inline-flex items-center gap-2.5 w-full px-2 py-2.5 no-underline text-inherit font-semibold rounded-lg hover:bg-white/8 focus:bg-white/8"
                      onClick={close}
                    >
                      <SettingsIcon className="h-4.5 w-4.5" /> Settings
                    </NavLink>
                  </li>
                </ul>

                <div className="mt-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2.5 w-full px-2 py-2.5 no-underline text-inherit font-semibold! rounded-lg bg-transparent border-0 cursor-pointer hover:bg-white/8 focus:bg-white/8"
                    onClick={() => {
                      close();
                      onSignOut?.();
                    }}
                  >
                    <LogOutIcon className="h-4.5 w-4.5" /> Sign out
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
