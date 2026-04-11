import React, { useEffect, useState } from "react";
import TicketObject from "./Ticket";
import { NavLink, useOutletContext } from "react-router-dom";
import { Ticket as TicketIcon, Film, CalendarDays, MapPin, Armchair } from "lucide-react";
import type { AppOutletContext } from "../AppShell";

const FEATURE_HINTS = [
  { icon: Film,        label: "Film or event title",  desc: "Log any screening — movies, concerts, live shows." },
  { icon: CalendarDays, label: "Date & time",          desc: "Never forget when the lights went down." },
  { icon: MapPin,      label: "Venue",                 desc: "The theater, arena, or cinema name." },
  { icon: Armchair,    label: "Theater & seat",        desc: "Exact auditorium and seat number, saved forever." },
] as const;

const TicketCollection: React.FC = () => {
    const { tickets, handleRemoveTicket, handleEditTicket, isLoading, isMobile, fetchError, onRetryFetch } = useOutletContext<AppOutletContext>();

    const [page, setPage] = useState(1);
    const TICKETS_PER_PAGE = isMobile ? 8 : 15;

    // Reset to page 1 whenever the ticket list grows or shrinks so that:
    // - A newly added ticket is visible immediately (would otherwise be hidden
    //   on a later page the user never navigated away from).
    // - Deleting tickets never leaves the user on a now-nonexistent page
    //   that renders an empty slice despite tickets existing on page 1.
    useEffect(() => {
        setPage(1);
    }, [tickets.length, isMobile]);

    const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);

    const startIndex = (page - 1) * TICKETS_PER_PAGE;
    const displayedTickets = tickets.slice(startIndex, startIndex + TICKETS_PER_PAGE);

    const goNext = () => setPage((prev) => Math.min(prev + 1, totalPages));
    const goPrev = () => setPage((prev) => Math.max(prev - 1, 1));

    const emptyStateClass = isMobile
        ? "emptyState flex flex-col items-center text-center text-secondary-content py-10 px-4 gap-3"
        : "emptyState flex flex-col items-center text-center text-secondary-content py-16 px-8 gap-4";

    const ticketIconClass = isMobile ? "w-12 h-12 opacity-80" : "w-16 h-16 opacity-80";

    const noTicketsHeadingClass = isMobile ? "font-bold m-0 text-lg" : "font-bold m-0 text-xl";

    const featureHintsClass = isMobile
        ? "featureHints grid grid-cols-1 px-5 pt-6 pb-4 gap-4"
        : "featureHints grid grid-cols-2 px-5 pt-8 pb-4 gap-x-8 gap-y-5 max-w-lg mx-auto";

    const featureHintsLabelClass = isMobile
        ? "col-span-full text-xs font-semibold uppercase tracking-widest text-copy-lighter m-0 mb-1"
        : "col-span-full text-xs font-semibold uppercase tracking-widest text-copy-lighter m-0 mb-2";

    return (
        <div className={"ticketCollection mx-auto " + (isMobile ? "w-102.5" : "w-250")}>
            {fetchError && (
                <div className="flex items-center justify-between gap-4 px-5 py-3 bg-red-100 text-red-800 rounded mb-2">
                    <span>{fetchError}</span>
                    <button
                        onClick={onRetryFetch}
                        className="bg-red-700 text-white px-3 py-1 rounded text-sm cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            )}
            <div className="ticketCardArea w-full flex justify-center mt-2.5">
            <div className="inline-flex flex-wrap justify-center gap-5 p-5 text-copy bg-primary">
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
                    <div className={emptyStateClass}>
                        <TicketIcon className={ticketIconClass} strokeWidth={1.25} />
                        <div>
                            <p className={noTicketsHeadingClass}>No tickets yet</p>
                            <p className="text-sm opacity-75 mt-1 mb-0">Your collection is empty. Add your first ticket to get started.</p>
                        </div>
                        <NavLink
                            to="/app/new"
                            className="inline-flex items-center gap-2 mt-1 px-5 py-2.5 bg-secondary-content text-primary font-semibold text-sm rounded-lg no-underline hover:opacity-90 transition-opacity"
                        >
                            + Add a Ticket
                        </NavLink>
                    </div>
                )}
            </div>
            </div>

            {!isLoading && tickets.length === 0 && (
                <div className={featureHintsClass}>
                    <p className={featureHintsLabelClass}>
                        What you can track
                    </p>
                    {FEATURE_HINTS.map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="flex items-start gap-3">
                            <Icon className="w-5 h-5 mt-0.5 shrink-0 text-primary" strokeWidth={1.5} />
                            <div>
                                <p className="m-0 text-sm font-semibold text-copy">{label}</p>
                                <p className="m-0 text-xs text-copy-lighter">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
