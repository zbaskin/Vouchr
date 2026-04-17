import React from "react";
import { useParams, Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../AppShell";
import { EventType } from "../API";
import { handleTicketDate, handleTicketTime } from "../utils/ticketFormat";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.MOVIE]: "Movie",
  [EventType.CONCERT]: "Concert",
  [EventType.SPORT]: "Sport",
  [EventType.FLIGHT]: "Flight",
};

const Row: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.8rem] font-semibold text-copy-light uppercase tracking-wide">{label}</span>
      <span className="text-[1rem] text-copy">{value}</span>
    </div>
  );
};

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { tickets } = useOutletContext<AppOutletContext>();

  const ticket = tickets.find((t) => (t as { id?: string }).id === id);

  if (!ticket) {
    return (
      <section className="max-w-250 mx-auto px-4 pt-6 pb-12 text-left">
        <Link to="/app/collection" className="text-sm text-primary hover:underline">
          ← Back to collection
        </Link>
        <p className="mt-6 text-copy-light">Ticket not found.</p>
      </section>
    );
  }

  const t = ticket as {
    id: string;
    name: string;
    type: EventType;
    venue?: string | null;
    theater?: string | null;
    seat?: string | null;
    city?: string | null;
    eventDate?: string | null;
    eventTime?: string | null;
  };

  const dateStr = handleTicketDate(t.eventDate);
  const timeStr = handleTicketTime(t.eventTime);

  return (
    <section className="max-w-250 mx-auto px-4 pt-6 pb-12 text-left">
      <Link to="/app/collection" className="text-sm text-primary hover:underline">
        ← Back to collection
      </Link>

      <div className="mt-4 bg-secondary-content border border-black/8 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,.08)] overflow-hidden">
        <header className="bg-primary text-secondary-content px-5 py-4">
          <h1 className="m-0 text-[1.4rem] leading-tight font-bold">{t.name}</h1>
          <p className="mt-1 mb-0 text-[0.95rem] opacity-90">{EVENT_TYPE_LABELS[t.type]}</p>
        </header>

        <div className="px-5 py-5 grid grid-cols-2 gap-x-6 gap-y-4 max-[480px]:grid-cols-1">
          {(dateStr || timeStr) && (
            <div className="col-span-full flex flex-col gap-0.5">
              <span className="text-[0.8rem] font-semibold text-copy-light uppercase tracking-wide">Date &amp; Time</span>
              <span className="text-[1rem] text-copy">
                {[dateStr, timeStr].filter(Boolean).join(" · ")}
              </span>
            </div>
          )}
          <Row label="Venue" value={t.venue} />
          <Row label="Theater" value={t.theater} />
          <Row label="Seat" value={t.seat} />
          <Row label="City" value={t.city} />
        </div>
      </div>
    </section>
  );
}
