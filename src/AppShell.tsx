import "./AppShell.css";
import { useEffect, useRef, useState } from "react";
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
  editTicket,
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
  handleEditTicket: (t: {
    id: string; name: string; venue: string; eventDate: string; eventTime: string; theater: string; seat: string;
  }) => Promise<void>;
};

type AppShellProps = {
  signOut?: UseAuthenticator["signOut"];
  user?: AuthUser;
};

/* ---------- helpers ---------- */
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

function useMediaQuery(query: string) {
  const get = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);

    // Set once in case query string changes
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Support older browsers
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}
/* -------------------------------- */

const AppShell: React.FC<AppShellProps> = ({ user }) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortType, setSortType] = useState<SortType>(SortType.TIME_CREATED); // safe default
  const ticketCollection = user?.userId;

  // mobile state (matchMedia avoids extra renders)
  const isMobile = useMediaQuery("(max-width: 499px)");

  // one-time: ensure user + collection exist
  useEffect(() => {
    (async () => {
      if (!user?.userId) return;
      const existing = await fetchUser(user.userId);
      if (!existing) {
        await addTicketCollection(user.userId);
        await addUser(user.userId, user.username as string, user.userId);
      }
    })();
  }, [user?.userId, user?.username]);

  // sync sortType with URL and server (runs when collection is known or URL changes)
  const initializedSortRef = useRef(false);
  useEffect(() => {
    (async () => {
      if (!ticketCollection) return;

      // URL has priority
      const urlSort = normalizeSort(searchParams.get("sort"));
      if (urlSort) {
        setSortType(urlSort);
        // fire-and-forget server update (no await needed for UI)
        updateSortType(ticketCollection, urlSort).catch(() => {});
        initializedSortRef.current = true;
        return;
      }

      // else use server preference, else default
      const serverSort = await fetchSortType(ticketCollection);
      const effective = serverSort ?? SortType.TIME_CREATED;
      setSortType(effective);
      const sp = new URLSearchParams(location.search);
      sp.set("sort", String(effective));
      setSearchParams(sp, { replace: true });
      initializedSortRef.current = true;
    })();
  }, [ticketCollection, location.search, searchParams, setSearchParams]);

  // fetch + apply sort whenever collection or sortType changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!ticketCollection || !initializedSortRef.current) return;
      setIsLoading(true);
      const raw = await fetchTickets(ticketCollection);
      if (!mounted) return;
      setTickets(sortTickets(raw, sortType));
      setIsLoading(false);
    })();
    return () => { mounted = false; };
  }, [ticketCollection, sortType]);

  /* ---------- actions ---------- */
  const handleAddTicket = async (newTicket: CreateTicketInput) => {
    if (!newTicket.name || !newTicket.ticketsID) return;
    await addTicket(newTicket);
    if (ticketCollection) {
      const raw = await fetchTickets(ticketCollection);
      setTickets(sortTickets(raw, sortType));
    }
  };

  const handleEditTicket: AppOutletContext["handleEditTicket"] = async (u) => {
    if (!u?.id) return;
    await editTicket({
      id: u.id,
      name: u.name,
      venue: u.venue,
      eventDate: u.eventDate,
      eventTime: u.eventTime.length === 5 ? `${u.eventTime}:00` : u.eventTime, // normalize HH:mm -> HH:mm:ss
      theater: u.theater,
      seat: u.seat,
    });

    if (ticketCollection) {
      const raw = await fetchTickets(ticketCollection);
      setTickets(sortTickets(raw, sortType));
    } else {
      setTickets(prev => (prev as Ticket[]).map(t => (t.id === u.id ? ({ ...t, ...u }) as Ticket : t)));
    }
  };

  const handleRemoveTicket = async (ticketID: string | null | undefined) => {
    if (!ticketID) return;
    const ok = window.confirm("Delete this ticket? This cannot be undone.");
    if (!ok) return;
    await removeTicket(ticketID);
    setTickets(prev => (prev as Ticket[]).filter(t => t.id !== ticketID));
  };

  const handleSignOut = async () => {
    try {
      await amplifySignOut({ global: false });
    } finally {
      window.location.replace("/");
    }
  };

  return (
    <>
      <Navbar
        isMobile={isMobile}
        sortType={sortType}
        onChangeSort={(next) => {
          // update URL (triggers fetch effect) and server preference
          const sp = new URLSearchParams(location.search);
          sp.set("sort", String(next));
          setSearchParams(sp, { replace: true });
          setSortType(next);
          if (ticketCollection) updateSortType(ticketCollection, next).catch(() => {});
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
              handleEditTicket,
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
