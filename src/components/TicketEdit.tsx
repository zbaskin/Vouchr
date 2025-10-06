import React, { useEffect, useState } from "react";

export type TicketEditValues = {
  id: string;
  name: string;
  venue: string;
  eventDate: string;  // "YYYY-MM-DD"
  eventTime: string;  // "HH:mm" or "HH:mm:ss"
  theater: string;
  seat: string;
};

type Props = {
  open: boolean;
  initial: TicketEditValues;
  onCancel: () => void;
  onSave: (values: TicketEditValues) => Promise<void> | void;
};

export default function TicketEdit({ open, initial, onCancel, onSave }: Props) {
  const [v, setV] = useState<TicketEditValues>(initial);

  useEffect(() => setV(initial), [initial]);

  if (!open) return null;

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    // simple client guards
    if (!v.name.trim()) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.eventDate)) return;
    await onSave(v);
    onCancel();
  };

  const input = "mt-1 w-full rounded-md border px-3 py-2";

  return (
    <div role="dialog" aria-modal="true"
         className="fixed inset-0 z-[1000] grid place-items-center bg-black/40">
      <div className="w-[min(92vw,600px)] rounded-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Ticket</h2>
          <button onClick={onCancel} className="rounded-md border px-2 py-1 text-sm">Close</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Title</span>
              <input className={input} value={v.name}
                     onChange={(e) => setV({ ...v, name: e.target.value })} required/>
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

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="rounded-md border px-3 py-2">
              Cancel
            </button>
            <button type="submit" className="rounded-md !bg-[var(--primary,#0a0a0a)] px-3 py-2 text-white">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
