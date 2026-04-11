import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { type CreateTicketInput, EventType, Visibility } from "../API";
import "react-datepicker/dist/react-datepicker.css";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../AppShell";
import { nowInSeconds } from "../utils/timestamp";

// eslint-disable-next-line react-refresh/only-export-components
export const initialState: CreateTicketInput = { owner: '', name: '', type: EventType.MOVIE, ticketsID: '', timeCreated: 0, visibility: Visibility.PRIVATE };

const TicketForm: React.FC = () => {
    const { ticketCollection, handleAddTicket } = useOutletContext<AppOutletContext>();
    const [formState, setFormState] = useState<CreateTicketInput>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [eventDateTime, setEventDateTime] = useState(new Date());

    const parseDateTime = () => {
        const dateTime = eventDateTime;
        const month = dateTime.getMonth() + 1;
        const day = dateTime.getDate();
        const year = dateTime.getFullYear();
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();

        const dateString = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
        const timeString = `${hour < 10 ? "0" : ""}${hour}:${minute < 10 ? "0" : ""}${minute}:00`;

        return [dateString, timeString];
    };

    const handleSubmit = async () => {
        if (!formState.name || isSubmitting) return;
        const [eventDate, eventTime] = parseDateTime();
        const newTicket = {
            ...formState,
            ticketsID: ticketCollection as string ?? '',
            timeCreated: nowInSeconds(),
            eventDate,
            eventTime
        };
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await handleAddTicket(newTicket);
            setFormState(initialState);
            setEventDateTime(new Date());
        } catch {
            setSubmitError("Failed to save ticket. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="max-w-250 mx-auto px-4 pt-6 pb-12 text-left">
            <div className="bg-secondary-content border border-black/8 rounded-[14px] shadow-[0_10px_30px_rgba(0,0,0,.08)] overflow-hidden">
                <header className="bg-primary text-secondary-content px-5 py-4">
                    <h1 className="m-0 text-[1.4rem] leading-tight font-bold">Add a Ticket</h1>
                    <p className="mt-1.5 mb-0 text-[0.95rem] opacity-90">Log your film experience — title, date, time, and where you saw it.</p>
                </header>

                <div className="px-5 pt-4.5 pb-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[768px]:grid-cols-1">
                        {/* Title */}
                        <div className="col-span-full flex flex-col gap-1.5">
                            <label htmlFor="movieName" className="text-[0.9rem] font-semibold text-primary-dark">Movie title</label>
                            <input
                                id="movieName"
                                className="w-full box-border px-3 py-2.5 border-[1.5px] border-border rounded-[10px] bg-white font-[inherit] text-copy outline-none transition-[border-color,box-shadow] duration-150 ease focus:border-primary focus:shadow-[0_0_0_3px_rgba(128,22,22,.15)]"
                                placeholder="e.g., Dune: Part Two"
                                value={formState.name}
                                onChange={(e) => { setSubmitError(null); setFormState({ ...formState, name: e.target.value }); }}
                                required
                            />
                        </div>

                        {/* Venue */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="venue" className="text-[0.9rem] font-semibold text-primary-dark">Venue</label>
                            <input
                                id="venue"
                                className="w-full box-border px-3 py-2.5 border-[1.5px] border-border rounded-[10px] bg-white font-[inherit] text-copy outline-none transition-[border-color,box-shadow] duration-150 ease focus:border-primary focus:shadow-[0_0_0_3px_rgba(128,22,22,.15)]"
                                placeholder="AMC Lincoln Square 13"
                                value={formState.venue ?? ""}
                                onChange={(e) => setFormState({ ...formState, venue: e.target.value })}
                            />
                            <span className="text-[0.8rem] text-copy-light">The cinema name (optional).</span>
                        </div>

                        {/* Theater */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="theater" className="text-[0.9rem] font-semibold text-primary-dark">Theater / Auditorium</label>
                            <input
                                id="theater"
                                className="w-full box-border px-3 py-2.5 border-[1.5px] border-border rounded-[10px] bg-white font-[inherit] text-copy outline-none transition-[border-color,box-shadow] duration-150 ease focus:border-primary focus:shadow-[0_0_0_3px_rgba(128,22,22,.15)]"
                                placeholder="IMAX, Theater 7"
                                value={formState.theater ?? ""}
                                onChange={(e) => setFormState({ ...formState, theater: e.target.value })}
                            />
                        </div>

                        {/* Date + Time */}
                        <div className="col-span-full flex flex-col gap-1.5">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 max-[480px]:grid-cols-1">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eventDate" className="text-[0.9rem] font-semibold text-primary-dark">Date</label>
                                    <DatePicker
                                        id="eventDate"
                                        selected={eventDateTime}
                                        onChange={(d: Date | null) => d && setEventDateTime(d)}
                                        dateFormat="yyyy-MM-dd"
                                        className="w-full box-border px-3 py-2.5 border-[1.5px] border-border rounded-[10px] bg-white font-[inherit] text-copy outline-none transition-[border-color,box-shadow] duration-150 ease focus:border-primary focus:shadow-[0_0_0_3px_rgba(128,22,22,.15)]"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eventTime" className="text-[0.9rem] font-semibold text-primary-dark">Time</label>
                                    <DatePicker
                                        id="eventTime"
                                        selected={eventDateTime}
                                        onChange={(d: Date | null) => d && setEventDateTime(d)}
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={5}
                                        timeCaption="Time"
                                        dateFormat="HH:mm"
                                        className="w-full box-border px-3 py-2.5 border-[1.5px] border-border rounded-[10px] bg-white font-[inherit] text-copy outline-none transition-[border-color,box-shadow] duration-150 ease focus:border-primary focus:shadow-[0_0_0_3px_rgba(128,22,22,.15)]"
                                    />
                                </div>
                            </div>
                            <span className="text-[0.8rem] text-copy-light">If you're not sure, you can leave time as-is.</span>
                        </div>

                        {/* Seat */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="seat" className="text-[0.9rem] font-semibold text-primary-dark">Seat</label>
                            <input
                                id="seat"
                                className="w-full box-border px-3 py-2.5 border-[1.5px] border-border rounded-[10px] bg-white font-[inherit] text-copy outline-none transition-[border-color,box-shadow] duration-150 ease focus:border-primary focus:shadow-[0_0_0_3px_rgba(128,22,22,.15)]"
                                placeholder="E12"
                                value={formState.seat ?? ""}
                                onChange={(e) => setFormState({ ...formState, seat: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {submitError && (
                    <div role="alert" className="mx-5 mt-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                        {submitError}
                    </div>
                )}

                <footer className="flex gap-2.5 px-5 pb-5 pt-2.5 flex-wrap">
                    <button
                        type="button"
                        className="appearance-none border-0 rounded-xl px-3.5 py-2.5 font-[inherit] cursor-pointer transition-[transform,box-shadow,background-color] duration-[40ms,150ms,200ms] ease bg-primary text-secondary-content shadow-[0_6px_16px_rgba(128,22,22,.25)] hover:-translate-y-px disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={!formState.name?.trim() || isSubmitting}
                    >
                        {isSubmitting ? "Saving…" : "Add Ticket"}
                    </button>

                    <button
                        type="button"
                        className="appearance-none rounded-xl px-3.5 py-2.5 font-[inherit] cursor-pointer transition-[transform,box-shadow,background-color] duration-[40ms,150ms,200ms] ease bg-white text-primary border-[1.5px] border-primary"
                        onClick={() => {
                            setFormState({ ...initialState, ticketsID: ticketCollection ?? '' });
                            setEventDateTime(new Date());
                        }}
                    >
                        Clear
                    </button>
                </footer>
            </div>
        </section>
    );
};

export default TicketForm;
