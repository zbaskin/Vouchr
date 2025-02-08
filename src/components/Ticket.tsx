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

const Ticket: React.FC<TicketProps> = ({ 
    id, name, venue, eventDate, eventTime, theater, seat, onRemove
}) => {
  return (
    <div className="ticketObject">
        <button className="removeTicketButton" onClick={() => onRemove(id)}>X</button>
        <p className="ticketVenue">{venue}</p>
        <p className="ticketName">{handleTicketName(name)}</p>
        <p className="ticketDetails">{eventDate}</p>
        <p className="ticketDetails">{eventTime}</p>
        <p className="ticketDetails">{theater}</p>
        <p className="ticketSeat">{seat}</p>
        <div className="ticketBarcode"></div>
    </div>
  );
};

export default Ticket;