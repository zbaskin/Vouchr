import React, { useEffect, useState } from "react";
import { EventType } from "../API";
import StarRating from "./StarRating";

export type TicketEditValues = {
  id: string;
  name: string;
  venue: string;
  eventDate: string;  // "YYYY-MM-DD"
  eventTime: string;  // "HH:mm" or "HH:mm:ss"
  theater: string;
  seat: string;
  type: EventType;
  rating: number | null;
};

type Props = {
  open: boolean;
  initial: TicketEditValues;
  onCancel: () => void;
  onSave: (values: TicketEditValues) => Promise<void> | void;
};

export default function TicketEdit({ open, initial, onCancel, onSave }: Props) {
  const [v, setV] = useState<TicketEditValues>(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => setV(initial), [initial]);

  if (!open) return null;

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!v.name.trim()) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)) {
      setSaveError("Please enter a valid event date.");
      return;
    }
    setIsSubmitting(true);
    setSaveError(null);
    try {
      await onSave(v);
      onCancel();
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const input = "mt-1 w-full rounded-md border px-3 py-2";

  return (
    <div role="dialog" aria-modal="true"
         className="fixed inset-0 z-1000 grid place-items-center bg-black/40"
         onClick={(e) => { e.stopPropagation(); onCancel(); }}>
      <div className="w-[min(92vw,600px)] rounded-xl bg-white p-4 shadow-xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Ticket</h2>
          <button onClick={onCancel} className="rounded-md border px-2 py-1 text-sm">Close</button>
        </div>

        {saveError && (
          <div role="alert" className="mb-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">Title</span>
            <input className={input} value={v.name}
                   onChange={(e) => { setSaveError(null); setV({ ...v, name: e.target.value }); }} required/>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Event type</span>
              <select
                className={input}
                value={v.type}
                onChange={(e) => setV({ ...v, type: e.target.value as EventType })}
              >
                <option value={EventType.MOVIE}>Movie</option>
                <option value={EventType.CONCERT}>Concert</option>
                <option value={EventType.SPORT}>Sport</option>
                <option value={EventType.FLIGHT}>Flight</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm">Venue</span>
              <input className={input} value={v.venue}
                     onChange={(e) => setV({ ...v, venue: e.target.value })} required/>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Event Date</span>
              <input type="date" className={input} value={v.eventDate}
                     onChange={(e) => setV({ ...v, eventDate: e.target.value })} required/>
            </label>
            <label className="block">
              <span className="text-sm">Event Time</span>
              <input type="time" className={input}
                     value={v.eventTime?.slice(0,5)}
                     onChange={(e) => setV({ ...v, eventTime: e.target.value })} required/>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Theater</span>
              <input className={input} value={v.theater}
                     onChange={(e) => setV({ ...v, theater: e.target.value })}/>
            </label>
            <label className="block">
              <span className="text-sm">Seat</span>
              <input className={input} value={v.seat}
                     onChange={(e) => setV({ ...v, seat: e.target.value })}/>
            </label>
          </div>

          <div>
            <span className="text-sm">Rating</span>
            <div className="mt-1">
              <StarRating value={v.rating} onChange={(r) => setV({ ...v, rating: r })} />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="rounded-md border px-3 py-2">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-(--primary,#0a0a0a)! px-3 py-2 text-white disabled:opacity-50">
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
