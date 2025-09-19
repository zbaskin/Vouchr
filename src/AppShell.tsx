import './AppShell.css';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';

import { 
  fetchTickets, 
  addTicket, 
  removeTicket, 
  fetchUser, 
  addUser, 
  addTicketCollection,
  fetchSortType,
  updateSortType,
} from './ticketService';

import Navbar from './components/Navbar';
import TicketForm from './components/TicketForm';
import TicketCollection from './components/TicketCollection';

import { 
  type CreateTicketInput, 
  type Ticket,
  SortType,
} from './API';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";

type AppShellProps = {
  signOut?: UseAuthenticator["signOut"];
  user?: AuthUser;
};

const normalizeSort = (v?: string | null): SortType => {
  switch ((v ?? "").toUpperCase()) {
    case "ALPHABETICAL": return SortType.ALPHABETICAL;
    case "EVENT_DATE":   return SortType.EVENT_DATE;
    case "TIME_CREATED": return SortType.TIME_CREATED;
    default:             return SortType.TIME_CREATED;
  }
};

const sortTickets = (items: Ticket[], sort: SortType): Ticket[] => {
  const copy = [...items];
  const safeTime = (t?: string) => (t ?? "").slice(0, 5); // HH:MM
  if (sort === SortType.ALPHABETICAL) {
    copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  } else if (sort === SortType.EVENT_DATE) {
    copy.sort((a, b) => {
      const [ah, am] = safeTime(a.eventTime ?? "").split(":").map(Number);
      const [bh, bm] = safeTime(b.eventTime ?? "").split(":").map(Number);
      const ad = a.eventDate ? new Date(a.eventDate) : null;
      const bd = b.eventDate ? new Date(b.eventDate) : null;
      if (ad) ad.setHours(Number.isFinite(ah) ? ah : 0, Number.isFinite(am) ? am : 0, 0, 0);
      if (bd) bd.setHours(Number.isFinite(bh) ? bh : 0, Number.isFinite(bm) ? bm : 0, 0, 0);
      return (bd?.getTime() ?? -Infinity) - (ad?.getTime() ?? -Infinity);
    });
  } else {
    copy.sort((a, b) => (b.timeCreated ?? 0) - (a.timeCreated ?? 0));
  }
  return copy;
};

const Settings: React.FC = () => (
  <div>
    <h2>Settings</h2>
    <p>Settings coming soon.</p>
  </div>
);

const AppShell: React.FC<AppShellProps> = ({ signOut, user }) => {
  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [ticketCollection] = useState(user?.userId);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(width < 500);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSort = normalizeSort(searchParams.get("sort"));
  const [sortType, setSortType] = useState<SortType>(urlSort);
  
  useEffect(() => {
    handleFetchUser();
    handleFetchTickets();
    window.addEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      if (!ticketCollection) return;
      if (!searchParams.get("sort")) {
        const serverSort = await fetchSortType(ticketCollection);
        const effective = serverSort ?? SortType.TIME_CREATED;
        setSortType(effective);
        const sp = new URLSearchParams(searchParams);
        sp.set("sort", effective);
        setSearchParams(sp, { replace: true });
      } else {
        setSortType(urlSort);
      }
    })();
  }, [ticketCollection]);

  useEffect(() => {
    if (!sortType) return;
    const sp = new URLSearchParams(searchParams);
    if (sp.get("sort") !== sortType) {
      sp.set("sort", sortType);
      setSearchParams(sp, { replace: true });
    }
    if (ticketCollection) {
      updateSortType(ticketCollection, sortType);
    }
  }, [sortType, ticketCollection]);

  useEffect(() => {
    setTickets(prev => sortTickets(prev as Ticket[], sortType));
  }, [sortType]);

  const handleResize = () => {
    setWidth(window.innerWidth);
    setIsMobile(window.innerWidth < 500);
  };

  const handleFetchTickets = async () => {
    if (!ticketCollection) return;
    setIsLoading(true);
    const raw = await fetchTickets(ticketCollection);
    setTickets(sortTickets(raw, sortType));
    setIsLoading(false);
  };

  const handleAddTicket = async (newTicket: CreateTicketInput) => {
    if (!newTicket.name || !newTicket.ticketsID) return;
    setTickets((prevTickets) => [...prevTickets, newTicket]);
    await addTicket(newTicket);
    await handleFetchTickets();
  };

  const handleRemoveTicket = async (ticketID: string | null | undefined) => {
    if (!ticketID) return;
    await removeTicket(ticketID);
    const updatedTickets = tickets.filter((ticket) => ticket.id !== ticketID);
    setTickets(updatedTickets);
  };

  const handleFetchUser = async () => {
    if (!user?.userId) return;
    const userData = await fetchUser(user.userId);
    if (!userData) {
      await addTicketCollection(user.userId);
      await addUser(user.userId, user.username as string, ticketCollection as string);
    }
  };

  return (
    <>
      <Navbar 
        isMobile={isMobile} 
        sortType={sortType}
        onChangeSort={setSortType}
        onSignOut={signOut}
      />
      <main className="appBody">
        <Routes>
          <Route
            path="collection"
            element={
              <TicketCollection
                tickets={tickets as Ticket[]}
                onRemoveTicket={handleRemoveTicket}
                isLoading={isLoading}
                isMobile={isMobile}
              />
            }
          />
          <Route
            path="new"
            element={
              <TicketForm
                ticketCollection={ticketCollection}
                onAddTicket={handleAddTicket}
              />
            }
          />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

export default withAuthenticator(AppShell);
