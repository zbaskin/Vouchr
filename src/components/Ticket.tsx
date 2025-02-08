import React from "react";
import "./Ticket.css";

type TicketProps = {
  id: string;
  name: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  theater: string;
  seat: string;
  onRemove: (id: string) => void;
};

const handleTicketName = (name: String) => {
    return name.substring(0, 20);
}

const handleTicketDate = (date: String) => {
    const [year, month, day] = date.split('-');
    return `${month}/${day}/${year}`;
}

const handleTicketTime = (time: String) => {
    const t = time.substring(0, 5);
    const hour = parseInt(t.split(':')[0]);
    const minute = t.split(':')[1];
    if (hour === 12) {
        return `${t}pm`;
    } else if (hour > 12) {
        return `${hour-12}:${minute}pm`;
    } else if (hour === 0) {
        return `${hour+12}:${minute}am`;
    }
    return `${hour}:${minute}am`;
}

const Ticket: React.FC<TicketProps> = ({ 
    id, name, venue, eventDate, eventTime, theater, seat, onRemove
}) => {
  return (
    <div className="ticketObject">
        <button className="removeTicketButton" onClick={() => onRemove(id)}>X</button>
        <div className="ticketVenue">{venue}</div>
        <div className="ticketName">{handleTicketName(name)}</div>
        <div className="ticketDetails">{handleTicketDate(eventDate)}</div>
        <div className="ticketDetails">{handleTicketTime(eventTime)}</div>
        <div className="ticketDetails">{theater}</div>
        <div className="ticketSeat">{seat}</div>
        <div className="ticketBarcode"></div>
        <div className="ticketFooter">Vouchr Tickets</div>
    </div>
  );
};

export default Ticket;