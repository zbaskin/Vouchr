import React, { useEffect, useState } from "react";
import TicketObject from "./Ticket";
import { useOutletContext } from "react-router-dom";
import type { AppOutletContext } from "../AppShell";

const TicketCollection: React.FC = () => {
    const { tickets, handleRemoveTicket, handleEditTicket, isLoading, isMobile } = useOutletContext<AppOutletContext>();

    const [page, setPage] = useState(1);
    const TICKETS_PER_PAGE = isMobile ? 8 : 15;

    // Reset to page 1 whenever the ticket list grows or shrinks so that:
    // - A newly added ticket is visible immediately (would otherwise be hidden
    //   on a later page the user never navigated away from).
    // - Deleting tickets never leaves the user on a now-nonexistent page
    //   that renders an empty slice despite tickets existing on page 1.
    useEffect(() => {
        setPage(1);
    }, [tickets.length]);

    const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);

    const startIndex = (page - 1) * TICKETS_PER_PAGE;
    const displayedTickets = tickets.slice(startIndex, startIndex + TICKETS_PER_PAGE);

    const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
    const goPrev = () => setPage((prev) => Math.max(prev - 1, 1));

    return (
        <div className={"ticketCollection " + (isMobile ? "w-[410px]" : "w-[1000px]")}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(175px,1fr))] justify-center gap-5 p-5 mt-2.5 text-copy bg-primary">
                {isLoading ? (
                    <p className="text-secondary-content">Loading tickets...</p>
                ) : tickets.length > 0 ? (
                    displayedTickets.map((ticket, index) => (
                        <TicketObject
                            key={ticket.id || index}
                            id={ticket.id || ""}
                            name={ticket.name}
                            venue={ticket.venue as string}
                            eventDate={ticket.eventDate}
                            eventTime={ticket.eventTime}
                            theater={ticket.theater as string}
                            seat={ticket.seat as string}
                            onRemove={handleRemoveTicket}
                            onEdit={handleEditTicket}
                        />
                    ))
                ) : (
                    <p className="text-secondary-content">No tickets available.</p>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center my-4 text-copy gap-2.5">
                    <button
                        onClick={goPrev}
                        disabled={page === 1}
                        className="bg-primary text-secondary-content border-0 px-3 py-2 cursor-pointer text-sm rounded-[5px] disabled:bg-[#ccc] disabled:text-white disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-bold">Page {page} of {totalPages}</span>
                    <button
                        onClick={goNext}
                        disabled={page === totalPages}
                        className="bg-primary text-secondary-content border-0 px-3 py-2 cursor-pointer text-sm rounded-[5px] disabled:bg-[#ccc] disabled:text-white disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TicketCollection;
