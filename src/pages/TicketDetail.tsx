import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../AppShell";
import { EventType } from "../API";
import { handleTicketDate, handleTicketTime } from "../utils/ticketFormat";
import TicketEdit, { type TicketEditValues } from "../components/TicketEdit";

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
  const { tickets, handleEditTicket, handleRemoveTicket } = useOutletContext<AppOutletContext>();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const initialEdit: TicketEditValues = {
    id: t.id,
    name: t.name,
    type: t.type,
    venue: t.venue ?? "",
    theater: t.theater ?? "",
    seat: t.seat ?? "",
    eventDate: t.eventDate ?? "",
    eventTime: t.eventTime ?? "",
  };

  const handleDelete = async () => {
    await handleRemoveTicket(t.id);
    navigate("/app/collection");
  };

  return (
    <section className="max-w-250 mx-auto px-4 pt-6 pb-12 text-left">
      <Link to="/app/collection" className="text-sm text-primary hover:underline">
        ← Back to collection
      </Link>

      <div className="mt-4 bg-secondary-content border border-black/8 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,.08)] overflow-hidden">
        <header className="bg-primary text-secondary-content px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="m-0 text-[1.4rem] leading-tight font-bold">{t.name}</h1>
            <p className="mt-1 mb-0 text-[0.95rem] opacity-90">{EVENT_TYPE_LABELS[t.type]}</p>
          </div>
          <div className="flex gap-2 shrink-0 mt-0.5">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="appearance-none rounded-lg px-3 py-1.5 text-sm font-semibold bg-secondary-content text-primary border border-secondary-content/30 cursor-pointer hover:opacity-90 transition-opacity"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="appearance-none rounded-lg px-3 py-1.5 text-sm font-semibold bg-white text-copy-light border border-black/15 cursor-pointer hover:text-copy hover:border-black/30 transition-colors"
            >
              Delete
            </button>
          </div>
        </header>

        {confirmDelete && (
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="flex-1">Are you sure you want to delete this ticket? This cannot be undone.</span>
            <button
              type="button"
              onClick={handleDelete}
              className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-white font-semibold cursor-pointer border-0 hover:opacity-90"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1.5 text-red-700 font-semibold cursor-pointer hover:opacity-90"
            >
              Cancel
            </button>
          </div>
        )}

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

      <TicketEdit
        open={editing}
        initial={initialEdit}
        onCancel={() => setEditing(false)}
        onSave={async (v) => {
          await handleEditTicket(v);
          setEditing(false);
        }}
      />
    </section>
  );
}
