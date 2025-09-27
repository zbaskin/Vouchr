import React, { useState } from "react";
import TicketObject from "./Ticket"; 
import "./TicketCollection.css";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../AppShell";

const TicketCollection: React.FC = () => { 
    const { tickets, handleRemoveTicket, handleEditTicket, isLoading, isMobile } = useOutletContext<AppOutletContext>();

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
                    <p className="ticketStatus">Loading tickets...</p>
                ) : tickets.length > 0 ? (
                    displayedTickets.map((ticket, index) => (
                        <TicketObject
                            key={ticket.id || index} 
                            id={ticket.id || ""} 
                            name={ticket.name} 
                            venue={ticket.venue as string}
                            eventDate={ticket.eventDate as string}
                            eventTime={ticket.eventTime as string}
                            theater={ticket.theater as string}
                            seat={ticket.seat as string}
                            onRemove={handleRemoveTicket}
                            onEdit={handleEditTicket}
                        />
                    ))
                ) : (
                    <p className="ticketStatus">No tickets available.</p>
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