// AppShell.tsx
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { signOut as amplifySignOut } from "aws-amplify/auth";

import {
  fetchTickets,
  addTicket,
  removeTicket,
  fetchUser,
  fetchSortType,
  updateSortType,
  editTicket,
  linkUserToCollection,
  ensureUser,
  createCollection,
} from "./ticketService";

import Navbar from "./components/Navbar";

import {
  type CreateTicketInput,
  type Ticket,
  SortType,
} from "./API";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

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

export const normalizeSort = (v?: string | null): SortType | null => {
  switch ((v ?? "").toUpperCase()) {
    case "ALPHABETICAL": return SortType.ALPHABETICAL;
    case "EVENT_DATE":   return SortType.EVENT_DATE;
    case "TIME_CREATED": return SortType.TIME_CREATED;
    default:             return null;
  }
};

const sortTickets = (items: Ticket[], sort: SortType): Ticket[] => {
  const copy = [...items];
  const safeTime = (t?: string) => (t ?? "").slice(0, 5);
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
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

const AppShell: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortType, setSortType] = useState<SortType>(SortType.TIME_CREATED);

  // ✅ keep the real collection id from the DB, not the user's sub
  const [ticketCollectionId, setTicketCollectionId] = useState<string | undefined>();
  const bootRef = useRef(false);

  const { authStatus, user } = useAuthenticator((ctx) => [ctx.authStatus, ctx.user]);
  const authReady = authStatus === "authenticated" && !!user;

  const isMobile = useMediaQuery("(max-width: 499px)");

  // ✅ one-time bootstrap: ensure User + TicketCollection exist and capture the collection id
  useEffect(() => {
    if (!authReady || bootRef.current || !user?.userId) return;
    bootRef.current = true;

    (async () => {
      const u = await ensureUser(user.username as string);
      if (!u) return;
      let collId = u.ticketsCollectionId as string | undefined;
      if (!collId) {
        collId = await createCollection();
        try { await linkUserToCollection(u.id, collId); }
        catch (e: any) {
          const msg = String(e?.message ?? e);
          if (!msg.includes('ConditionalCheckFailed')) throw e;
          const latest = await fetchUser(u.id);
          collId = latest?.ticketsCollectionId ?? collId;
        }
      }
      setTicketCollectionId(collId);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.userId, user?.username]);

  // ✅ init sort from URL or server, once the collection id is known
  const initializedSortRef = useRef(false);
  useEffect(() => {
    if (!authReady || !ticketCollectionId) return;
    (async () => {
      // URL has priority
      const urlSort = normalizeSort(searchParams.get("sort"));
      if (urlSort) {
        setSortType(urlSort);
        updateSortType(ticketCollectionId, urlSort).catch(() => {});
        initializedSortRef.current = true;
        return;
      }

      // Use server preference; fallback to TIME_CREATED
      const serverSort = await fetchSortType(ticketCollectionId);
      const effective = serverSort ?? SortType.TIME_CREATED;
      setSortType(effective);
      const sp = new URLSearchParams(location.search);
      sp.set("sort", String(effective));
      setSearchParams(sp, { replace: true });
      initializedSortRef.current = true;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, ticketCollectionId]);

  // ✅ fetch tickets whenever collection or sort changes (after sort initialized)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!authReady || !ticketCollectionId || !initializedSortRef.current) return;
      setIsLoading(true);
      const raw = await fetchTickets(ticketCollectionId);
      if (!mounted) return;
      setTickets(sortTickets(raw, sortType));
      setIsLoading(false);
    })();
    return () => { mounted = false; };
  }, [authReady, ticketCollectionId, sortType]);

  /* ---------- actions ---------- */

  // ✅ ensure ticketsID is set to the current collection id before calling addTicket
  const handleAddTicket = async (newTicket: CreateTicketInput) => {
    if (!newTicket.name || !ticketCollectionId) return;
    newTicket = { ...newTicket, ticketsID: ticketCollectionId };
    try {
      await addTicket(newTicket);
      const raw = await fetchTickets(ticketCollectionId);
      setTickets(sortTickets(raw, sortType));
    } catch (err) {
      console.error('Error adding ticket:', err);
      throw err;
    }
  };

  const handleEditTicket: AppOutletContext["handleEditTicket"] = async (u) => {
    if (!u?.id) return;
    await editTicket({
      id: u.id,
      name: u.name,
      venue: u.venue,
      eventDate: u.eventDate,
      eventTime: u.eventTime.length === 5 ? `${u.eventTime}:00` : u.eventTime,
      theater: u.theater,
      seat: u.seat,
    });

    if (ticketCollectionId) {
      const raw = await fetchTickets(ticketCollectionId);
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

  if (!authReady) {
    return <main className="bg-background min-h-screen" />;
  }

  return (
    <>
      <Navbar
        isMobile={isMobile}
        sortType={sortType}
        onChangeSort={(next) => {
          const sp = new URLSearchParams(location.search);
          sp.set("sort", String(next));
          setSearchParams(sp, { replace: true });
          setSortType(next);
          if (ticketCollectionId) updateSortType(ticketCollectionId, next).catch(() => {});
        }}
        onSignOut={handleSignOut}
      />
      <main className="bg-background min-h-screen">
        <Outlet
          context={
            {
              tickets,
              isLoading,
              isMobile,
              handleAddTicket,
              handleEditTicket,
              handleRemoveTicket,
              ticketCollection: ticketCollectionId,  // ✅ expose the real id
            } satisfies AppOutletContext
          }
        />
      </main>
    </>
  );
};

export default AppShell;
