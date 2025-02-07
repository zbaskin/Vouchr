import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { type CreateTicketInput, EventType } from "../API";
import "./TicketForm.css"; // Ensure correct styles are applied

type TicketFormProps = {
  ticketCollection: string | undefined;
  onAddTicket: (ticket: CreateTicketInput) => void;
};

const initialState: CreateTicketInput = { name: '', type: EventType.MOVIE, ticketsID: '', timeCreated: Date.now() };

const TicketForm: React.FC<TicketFormProps> = ({ ticketCollection, onAddTicket }) => {
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
            ticketsID: ticketCollection as string, 
            timeCreated: Date.now(),
            eventDate,
            eventTime
        };
        setFormState(initialState); // Reset form
        onAddTicket(newTicket);
    };

    return (
        <div className="ticketForm">
            <div className="ticketInputContainer">
                <input
                onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                className="ticketInput"
                value={formState.name}
                placeholder="Movie Name"
                />
                <input
                onChange={(event) => setFormState({ ...formState, venue: event.target.value })}
                className="ticketInput"
                value={formState.venue || ""}
                placeholder="Theater Name"
                />
                <div className="ticketInputSmall">
                <DatePicker
                    className="ticketInput"
                    selected={eventDateTime}
                    maxDate={new Date()}
                    onChange={(date) => date && setEventDateTime(date)}
                />
                <DatePicker
                    className="ticketInput"
                    selected={eventDateTime}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={5}
                    dateFormat="h:mm aa"
                    onChange={(time) => time && setEventDateTime(time)}
                />
                </div>
                <div className="ticketInputSmall">
                <input
                    onChange={(event) => setFormState({ ...formState, theater: event.target.value })}
                    className="ticketInput"
                    value={formState.theater || ""}
                    placeholder="Room"
                />
                <input
                    onChange={(event) => setFormState({ ...formState, seat: event.target.value })}
                    className="ticketInput"
                    value={formState.seat || ""}
                    placeholder="Seat"
                />
                </div>
            </div>
            <button className="createTicketButton" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
};

export default TicketForm;
