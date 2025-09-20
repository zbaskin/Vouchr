import "./AppShell.css";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { signOut as amplifySignOut } from "aws-amplify/auth";

import {
  fetchTickets,
  addTicket,
  removeTicket,
  fetchUser,
  addUser,
  addTicketCollection,
  fetchSortType,
  updateSortType,
} from "./ticketService";

import Navbar from "./components/Navbar";

import {
  type CreateTicketInput,
  type Ticket,
  SortType,
} from "./API";

import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";

export type AppOutletContext = {
  tickets: (Ticket | CreateTicketInput)[];
  isLoading: boolean;
  isMobile: boolean;
  ticketCollection?: string;
  handleAddTicket: (t: CreateTicketInput) => Promise<void>;
  handleRemoveTicket: (id: string | null | undefined) => Promise<void>;
};

type AppShellProps = {
  signOut?: UseAuthenticator["signOut"];
  user?: AuthUser;
};

const normalizeSort = (v?: string | null): SortType | null => {
  switch ((v ?? "").toUpperCase()) {
    case "ALPHABETICAL": return SortType.ALPHABETICAL;
    case "EVENT_DATE":   return SortType.EVENT_DATE;
    case "TIME_CREATED": return SortType.TIME_CREATED;
    default:             return null;
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

const AppShell: React.FC<AppShellProps> = ({ signOut, user }) => {
  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [ticketCollection] = useState(user?.userId);
  const [isLoading, setIsLoading] = useState(false);

  const [width, setWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(width < 500);

  const location = useLocation();
  const [_searchParams, setSearchParams] = useSearchParams();

  const [sortType, setSortType] = useState<SortType | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 500);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      if (!user?.userId) return;
      const userData = await fetchUser(user.userId);
      if (!userData) {
        await addTicketCollection(user.userId);
        await addUser(user.userId, user.username as string, ticketCollection as string);
      }
    })();
  }, [user?.userId]);

  useEffect(() => {
    (async () => {
      if (!ticketCollection) return;
      setIsLoading(true);
      const raw = await fetchTickets(ticketCollection);
      setTickets(sortType !== null ? sortTickets(raw, sortType) : raw);
      setIsLoading(false);
    })();
  }, [ticketCollection]);

  useEffect(() => {
    (async () => {
      if (!ticketCollection) return;

      const sp = new URLSearchParams(location.search);
      const urlSort = normalizeSort(sp.get("sort"));

      if (urlSort !== null) {
        if (sortType !== urlSort) setSortType(urlSort);
        await updateSortType(ticketCollection, urlSort);
        return;
      }

      const serverSort = await fetchSortType(ticketCollection);
      const effective: SortType = serverSort ?? SortType.TIME_CREATED;
      setSortType(effective);
      sp.set("sort", String(effective));
      setSearchParams(sp, { replace: true });
    })();
  }, [ticketCollection, location.search]);

  useEffect(() => {
    if (sortType === null) return;
    setTickets(prev => sortTickets(prev as Ticket[], sortType));
  }, [sortType]);

  const handleAddTicket = async (newTicket: CreateTicketInput) => {
    if (!newTicket.name || !newTicket.ticketsID) return;
    setTickets(prev => [...prev, newTicket]);
    await addTicket(newTicket);
    // re-fetch to get server fields (ids, timeCreated) and apply current sort
    if (ticketCollection) {
      const raw = await fetchTickets(ticketCollection);
      setTickets(sortType !== null ? sortTickets(raw, sortType) : raw);
    }
  };

  const handleRemoveTicket = async (ticketID: string | null | undefined) => {
    if (!ticketID) return;
    await removeTicket(ticketID);
    setTickets(prev => (prev as Ticket[]).filter(t => t.id !== ticketID));
  };

  const handleSignOut = async () => {
    try {
      if (typeof signOut === "function") {
        await signOut();
      } else {
        await amplifySignOut({ global: false });
      }
    } finally {
      window.location.replace("/");
    }
  };

  return (
    <>
      <Navbar
        isMobile={isMobile}
        sortType={sortType ?? SortType.TIME_CREATED}
        onChangeSort={(next) => {
          const sp = new URLSearchParams(location.search);
          sp.set("sort", String(next));
          setSearchParams(sp, { replace: true });
        }}
        onSignOut={handleSignOut}
      />
      <main className="appBody">
        <Outlet
          context={
            {
              tickets,
              isLoading,
              isMobile,
              handleAddTicket,
              handleRemoveTicket,
              ticketCollection,
            } satisfies AppOutletContext
          }
        />
      </main>
    </>
  );
};

export default withAuthenticator(AppShell);
