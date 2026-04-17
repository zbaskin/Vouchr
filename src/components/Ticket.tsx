import React, { useEffect, useMemo, useRef, useState } from "react";
import TicketEdit, { TicketEditValues } from "./TicketEdit";
import { Pencil, Trash2 } from "lucide-react";
import { handleTicketDate, handleTicketTime } from "../utils/ticketFormat";
import { EventType } from "../API";

type TicketProps = {
  id: string;
  name: string;
  venue: string;
  eventDate?: string | null;  // "YYYY-MM-DD" — nullable in GraphQL schema
  eventTime?: string | null;  // "HH:mm:ss" or "HH:mm" — nullable in GraphQL schema
  theater: string;
  seat: string;
  type?: EventType | null;
  onRemove: (id: string) => void;
  onEdit?: (v: TicketEditValues) => Promise<void> | void;
  onNavigate?: () => void;
};

const Ticket: React.FC<TicketProps> = ({
  id,
  name,
  venue,
  eventDate,
  eventTime,
  theater,
  seat,
  type,
  onRemove,
  onEdit,
  onNavigate,
}) => {
  // Overflow detection on the clamped text node
  const nameWrapRef = useRef<HTMLDivElement | null>(null);
  const nameTextRef = useRef<HTMLSpanElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Popover state (fixed; no layout shift)
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      const text = nameTextRef.current;
      if (!text) return;
      const tol = 1; // px
      const hOverflow = text.scrollHeight - text.clientHeight > tol;
      const wOverflow = text.scrollWidth - text.clientWidth > tol;
      setIsOverflowing(hOverflow || wOverflow);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    schedule();

    if (document?.fonts?.ready) {
      document.fonts.ready.then(schedule).catch(() => {});
    }

    const ro = new ResizeObserver(schedule);
    if (nameTextRef.current) ro.observe(nameTextRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [name]);

  const openPopover = () => {
    if (!isOverflowing) return;
    const el = nameWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPopoverPos({
      top: Math.max(12, rect.top - 8),
      left: Math.min(window.innerWidth - 16, Math.max(16, rect.left + rect.width / 2)),
    });
    setShowPopover(true);
  };
  const closePopover = () => setShowPopover(false);

  const onNameKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (showPopover) { closePopover(); } else { openPopover(); }
    } else if (e.key === "Escape") {
      closePopover();
    }
  };

  const [editing, setEditing] = useState(false);

  const initialEdit = useMemo<TicketEditValues>(
    () => ({ id, name, venue, eventDate: eventDate ?? "", eventTime: eventTime ?? "", theater, seat, type: type ?? EventType.MOVIE }),
    [id, name, venue, eventDate, eventTime, theater, seat, type],
  );

  return (
    <div
      className={`ticketObject bg-white w-43.75 min-h-43.75 p-2.5 border border-[#ccc] shadow-[2px_2px_8px_rgba(0,0,0,0.2)] font-[Arial,sans-serif] text-sm text-center relative flex flex-col justify-center text-copy max-w-full${onNavigate ? " cursor-pointer" : ""}`}
      onClick={onNavigate}
    >
      <div>
        <button
            className="editTicketButton absolute top-0.75 right-6.5 w-5 h-5 border border-black text-center justify-items-center leading-3 font-bold text-xs cursor-pointer p-0"
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            aria-label="Edit ticket"
            title="Edit"
        >
            <Pencil size={14} />
        </button>
        <button
            className="removeTicketButton absolute top-0.75 right-0.75 w-5 h-5 border border-black text-center justify-items-center leading-3 font-bold text-xs cursor-pointer p-0"
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            aria-label="Remove ticket"
            title="Remove"
        >
            <Trash2 size={14} />
        </button>
      </div>

      {venue && <div className="text-xs font-bold text-left">{venue}</div>}

      {/* titleClamp: position:relative + overflow:hidden + 2-line max-height */}
      <div
        ref={nameWrapRef}
        className={`ticketName titleClamp text-base font-bold uppercase my-1.25 relative overflow-hidden leading-tight max-h-[calc(1.25em*2)]${isOverflowing ? " hasOverflow cursor-pointer focus:outline-2 focus:outline-[#9ca3af] focus:outline-offset-2" : ""}`}
        title={!isOverflowing ? name : undefined}
        aria-label={name}
        role={isOverflowing ? "button" : undefined}
        tabIndex={isOverflowing ? 0 : -1}
        onClick={isOverflowing ? openPopover : undefined}
        onKeyDown={isOverflowing ? onNameKeyDown : undefined}
      >
        <span ref={nameTextRef} className="ticketNameText [-webkit-box-orient:vertical] [display:-webkit-box] overflow-hidden line-clamp-2">
          {name}
        </span>
      </div>

      <div className="text-xs leading-normal">
        {handleTicketDate(eventDate)} &nbsp;
        {handleTicketTime(eventTime)}
      </div>

      {(seat || theater) && (
        <div className="flex justify-between text-sm font-bold mt-2.5">
          {seat && (
            <div>
              Seat <span className="text-sm font-bold mt-2.5 bg-copy text-white p-0.75 rounded-[3px]">{seat}</span>
            </div>
          )}
          {theater && (
            <div>
              Theater <span>{theater}</span>
            </div>
          )}
        </div>
      )}

      <div className="text-[10px] text-copy-lighter mt-3.75">Vouchr Tickets</div>

      {showPopover && popoverPos && (
        <>
          <button
            className="fixed inset-0 bg-transparent border-0 p-0 m-0 z-40"
            onClick={closePopover}
            aria-label="Close"
          />
          <div
            className="titlePopover fixed z-50 max-w-[min(92vw,720px)]"
            style={{
              top: popoverPos.top,
              left: popoverPos.left,
              transform: "translateX(-50%) translateY(-100%)",
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="titlePopoverContent block max-h-[50vh] overflow-auto bg-white px-3 py-2.5 rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-black/8 font-[inherit] text-inherit leading-tight">
              {name}
            </div>
          </div>
        </>
      )}

      {editing && onEdit && (
        <TicketEdit
          open={editing}
          initial={initialEdit}
          onCancel={() => setEditing(false)}
          onSave={async (v) => { await onEdit(v); }}
        />
      )}
    </div>
  );
};

export default Ticket;
