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

const Ticket: React.FC<TicketProps> = ({ 
    id, name, venue, eventDate, eventTime, theater, seat, onRemove
}) => {
  return (
    <div className="ticketObject">
        <button className="removeTicketButton" onClick={() => onRemove(id)}>X</button>
        <p className="ticketProperty">{name}</p>
        <p className="ticketProperty">{venue}</p>
        <p className="ticketProperty">{eventDate}</p>
        <p className="ticketProperty">{eventTime}</p>
        <p className="ticketProperty">{theater}</p>
        <p className="ticketProperty">{seat}</p>
    </div>
  );
};

export default Ticket;