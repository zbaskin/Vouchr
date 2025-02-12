import React, { useState } from "react";
import TicketObject from "./Ticket"; 
import "./TicketCollection.css";
import { type Ticket } from '../API';


type TicketCollectionProps = {
    tickets: Ticket[];
    onRemoveTicket: (id: string) => void;
    isLoading: boolean;
    isMobile: boolean;
}



const TicketCollection: React.FC<TicketCollectionProps> = ({ 
    tickets, onRemoveTicket, isLoading, isMobile 
}) => {
    const [page, setPage] = useState(1);
    const TICKETS_PER_PAGE = isMobile ? 8 : 15;
    
    const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
    
    const startIndex = (page - 1) * TICKETS_PER_PAGE;
    const displayedTickets = tickets.slice(startIndex, startIndex + TICKETS_PER_PAGE);

    const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
    const goPrev = () => setPage((prev) => Math.max(prev - 1, 1));

    return (
        <div className={"ticketCollection " + (isMobile ? "tcMobile" : "tcDesktop")}>
            <div className="tickets">
                {isLoading ? (
                    <p>Loading tickets...</p>
                ) : tickets.length > 0 ? (
                    displayedTickets.map((ticket, index) => (
                        <TicketObject
                            key={ticket.id || index} 
                            id={ticket.id} 
                            name={ticket.name} 
                            venue={ticket.venue as string}
                            eventDate={ticket.eventDate as string}
                            eventTime={ticket.eventTime as string}
                            theater={ticket.theater as string}
                            seat={ticket.seat as string}
                            onRemove={onRemoveTicket}
                        />
                    ))
                ) : (
                    <p>No tickets available.</p>
                )}
            </div>
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={goPrev} disabled={page === 1}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button onClick={goNext} disabled={page === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
};

export default TicketCollection;