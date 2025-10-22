import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { type CreateTicketInput, EventType, Visibility } from "../API";
import "react-datepicker/dist/react-datepicker.css";
import "./TicketForm.css";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../AppShell";

const initialState: CreateTicketInput = { owner: '', name: '', type: EventType.MOVIE, ticketsID: '', timeCreated: Date.now(), visibility: Visibility.PRIVATE };

const TicketForm: React.FC = () => { 
    const { ticketCollection, handleAddTicket } = useOutletContext<AppOutletContext>();
    const [formState, setFormState] = useState<CreateTicketInput>(initialState);

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

    const handleSubmit = () => {
        if (!formState.name) return;
        const [eventDate, eventTime] = parseDateTime();
        const newTicket = { 
            ...formState, 
            ticketsID: ticketCollection as string ?? '', 
            timeCreated: Date.now(),
            eventDate,
            eventTime
        };
        setFormState(initialState); // Reset form
        handleAddTicket(newTicket);
    };

    return (
        <section className="ticketFormPage">
            <div className="formCard">
            <header className="formHeader">
                <h1 className="formTitle">Add a Ticket</h1>
                <p className="formSubtitle">Log your film experience — title, date, time, and where you saw it.</p>
            </header>

            <div className="formBody">
                <div className="formGrid">
                {/* Title */}
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="movieName">Movie title</label>
                    <input
                        id="movieName"
                        className="input"
                        placeholder="e.g., Dune: Part Two"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        required
                    />
                </div>

                {/* Venue */}
                <div className="field">
                    <label htmlFor="venue">Venue</label>
                    <input
                        id="venue"
                        className="input"
                        placeholder="AMC Lincoln Square 13"
                        value={formState.venue ?? ""}
                        onChange={(e) => setFormState({ ...formState, venue: e.target.value })}
                    />
                    <span className="hint">The cinema name (optional).</span>
                </div>

                {/* Theater */}
                <div className="field">
                    <label htmlFor="theater">Theater / Auditorium</label>
                    <input
                        id="theater"
                        className="input"
                        placeholder="IMAX, Theater 7"
                        value={formState.theater ?? ""}
                        onChange={(e) => setFormState({ ...formState, theater: e.target.value })}
                    />
                </div>

                {/* Date + Time */}
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <div className="inlineRow">
                        <div className="field">
                            <label htmlFor="eventDate">Date</label>
                            <DatePicker
                                id="eventDate"
                                selected={eventDateTime}
                                onChange={(d) => d && setEventDateTime(d)}
                                dateFormat="yyyy-MM-dd"
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="eventTime">Time</label>
                            <DatePicker
                                id="eventTime"
                                selected={eventDateTime}
                                onChange={(d) => d && setEventDateTime(d)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={5}
                                timeCaption="Time"
                                dateFormat="HH:mm"
                                className="input"
                            />
                        </div>
                    </div>
                    <span className="hint">If you’re not sure, you can leave time as-is.</span>
                </div>

                {/* Seat */}
                <div className="field">
                    <label htmlFor="seat">Seat</label>
                    <input
                        id="seat"
                        className="input"
                        placeholder="E12"
                        value={formState.seat ?? ""}
                        onChange={(e) => setFormState({ ...formState, seat: e.target.value })}
                    />
                </div>

                {/* (Optional) Type — if you plan to support concerts/sports later, keep it hidden defaulting to MOVIE. */}
                {/* You can render a select here if you want the user to choose the EventType */}
                </div>
            </div>

            <footer className="formFooter">
                <button
                    type="button"
                    className="btn btnPrimary"
                    onClick={handleSubmit}
                    disabled={!formState.name?.trim()}
                >
                    Add Ticket
                </button>

                <button
                    type="button"
                    className="btn btnSecondary"
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
