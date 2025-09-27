import React, { useEffect, useRef, useState } from "react";
import "./Ticket.css";

type TicketProps = {
  id: string;
  name: string;
  venue: string;
  eventDate: string;  // "YYYY-MM-DD"
  eventTime: string;  // "HH:mm:ss" or "HH:mm"
  theater: string;
  seat: string;
  onRemove: (id: string) => void;
};

const handleTicketDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${month}/${day}/${year}`;
};

const handleTicketTime = (time: string) => {
  const t = time.substring(0, 5);
  const hour = parseInt(t.split(":")[0], 10);
  const minute = t.split(":")[1];
  if (hour === 12) return `${t}pm`;
  if (hour > 12) return `${hour - 12}:${minute}pm`;
  if (hour === 0) return `${hour + 12}:${minute}am`;
  return `${hour}:${minute}am`;
};

const Ticket: React.FC<TicketProps> = ({
  id,
  name,
  venue,
  eventDate,
  eventTime,
  theater,
  seat,
  onRemove,
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

    // @ts-ignore web fonts ready
    if (document?.fonts?.ready) {
      // @ts-ignore
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
      showPopover ? closePopover() : openPopover();
    } else if (e.key === "Escape") {
      closePopover();
    }
  };

  return (
    <div className="ticketObject">
      <button
        className="removeTicketButton"
        onClick={() => onRemove(id)}
        aria-label="Remove ticket"
        title="Remove"
      >
        X
      </button>

      <div className="ticketVenue">{venue}</div>

      {/* Keep your original .ticketName styling; we only add titleClamp + inner span */}
      <div
        ref={nameWrapRef}
        className={`ticketName titleClamp ${isOverflowing ? "hasOverflow" : ""}`}
        title={!isOverflowing ? name : undefined}
        aria-label={name}
        role={isOverflowing ? "button" : undefined}
        tabIndex={isOverflowing ? 0 : -1}
        onClick={isOverflowing ? openPopover : undefined}
        onKeyDown={isOverflowing ? onNameKeyDown : undefined}
      >
        <span ref={nameTextRef} className="ticketNameText">
          {name}
        </span>
      </div>

      <div className="ticketDateTime">
        {handleTicketDate(eventDate)} &nbsp;
        {handleTicketTime(eventTime)}
      </div>

      <div className="ticketInfo">
        <div>
          Seat <span className="ticketSeat">{seat}</span>
        </div>
        <div>
          Theater <span>{theater}</span>
        </div>
      </div>

      <div className="ticketFooter">Vouchr Tickets</div>

      {showPopover && popoverPos && (
        <>
          <button className="titlePopoverBackdrop" onClick={closePopover} aria-label="Close" />
          <div
            className="titlePopover"
            style={{
              top: popoverPos.top,
              left: popoverPos.left,
              transform: "translateX(-50%) translateY(-100%)",
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="titlePopoverContent">{name}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Ticket;
