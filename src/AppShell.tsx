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
  fetchError: string | null;
  onRetryFetch: () => void;
  handleAddTicket: (t: CreateTicketInput) => Promise<void>;
  handleRemoveTicket: (id: string | null | undefined) => Promise<void>;
  handleEditTicket: (t: {
    id: string; name: string; venue: string; eventDate: string; eventTime: string; theater: string; seat: string;
  }) => Promise<void>;
  onChangeSort: (sort: SortType) => void;
};

export const normalizeSort = (v?: string | null): SortType | null => {
  switch ((v ?? "").toUpperCase()) {
    case "ALPHABETICAL": return SortType.ALPHABETICAL;
    case "EVENT_DATE":   return SortType.EVENT_DATE;
    case "TIME_CREATED": return SortType.TIME_CREATED;
    default:             return null;
  }
};

/**
 * Construct a Date in LOCAL time from a "YYYY-MM-DD" date string and an optional
 * "HH:MM" or "HH:MM:SS" time string.
 *
 * Why not `new Date(dateStr)`?
 * Date-only ISO strings (YYYY-MM-DD) are parsed as **UTC midnight** per spec.
 * In timezones west of UTC (e.g. EST = UTC-5), UTC midnight falls on the
 * *previous calendar day* locally, so `new Date("2024-03-15").getDate()` returns
 * 14 in EST. Subsequent `.setHours()` then stamps the wrong calendar day.
 *
 * Using `new Date(year, month-1, day, h, m)` always constructs in local time.
 */
export function buildEventDate(dateStr: string | null | undefined, timeStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  const timeParts = (timeStr ?? "").split(":").map(Number);
  const h = Number.isFinite(timeParts[0]) ? timeParts[0] : 0;
  const min = Number.isFinite(timeParts[1]) ? timeParts[1] : 0;
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export const sortTickets = (items: Ticket[], sort: SortType): Ticket[] => {
  const copy = [...items];
  if (sort === SortType.ALPHABETICAL) {
    copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  } else if (sort === SortType.EVENT_DATE) {
    copy.sort((a, b) => {
      const ad = buildEventDate(a.eventDate, a.eventTime);
      const bd = buildEventDate(b.eventDate, b.eventTime);
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchRetry, setFetchRetry] = useState(0);
  const [sortType, setSortType] = useState<SortType>(SortType.TIME_CREATED);

  // ✅ keep the real collection id from the DB, not the user's sub
  const [ticketCollectionId, setTicketCollectionId] = useState<string | undefined>();
  const [sortReady, setSortReady] = useState(false);
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
  useEffect(() => {
    if (!authReady || !ticketCollectionId) return;
    (async () => {
      // URL has priority
      const urlSort = normalizeSort(searchParams.get("sort"));
      if (urlSort) {
        setSortType(urlSort);
        updateSortType(ticketCollectionId, urlSort).catch(() => {});
        setSortReady(true);
        return;
      }

      // Use server preference; fallback to TIME_CREATED
      const serverSort = await fetchSortType(ticketCollectionId);
      const effective = serverSort ?? SortType.TIME_CREATED;
      setSortType(effective);
      const sp = new URLSearchParams(location.search);
      sp.set("sort", String(effective));
      setSearchParams(sp, { replace: true });
      setSortReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, ticketCollectionId]);

  // ✅ fetch tickets whenever collection, sort, or fetchRetry changes (after sort initialized)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!authReady || !ticketCollectionId || !sortReady) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const raw = await fetchTickets(ticketCollectionId);
        if (!mounted) return;
        setTickets(sortTickets(raw, sortType));
      } catch (err) {
        if (!mounted) return;
        console.error('Error fetching tickets:', err);
        setFetchError('Failed to load tickets. Please try again.');
        // Preserve existing tickets — do not wipe the collection on error
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authReady, ticketCollectionId, sortType, sortReady, fetchRetry]);

  /* ---------- actions ---------- */

  // ✅ ensure ticketsID is set to the current collection id before calling addTicket
  const handleAddTicket = async (newTicket: CreateTicketInput) => {
    if (!newTicket.name || !ticketCollectionId) return;
    newTicket = { ...newTicket, ticketsID: ticketCollectionId };
    await addTicket(newTicket); // throws on failure — propagates to TicketForm
    // Refresh is best-effort; a failure here does not undo the successful add
    try {
      const raw = await fetchTickets(ticketCollectionId);
      setTickets(sortTickets(raw, sortType));
    } catch (err) {
      console.warn('Could not refresh tickets after add (non-fatal):', err);
      handleRetryFetch();
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
    }); // throws on failure — propagates to TicketEdit
    // Refresh is best-effort; a failure here does not undo the successful edit
    if (ticketCollectionId) {
      try {
        const raw = await fetchTickets(ticketCollectionId);
        setTickets(sortTickets(raw, sortType));
      } catch (err) {
        console.warn('Could not refresh tickets after edit (non-fatal):', err);
        // Optimistically update in-place so the user sees the edit immediately
        setTickets(prev => (prev as Ticket[]).map(t => (t.id === u.id ? ({ ...t, ...u }) as Ticket : t)));
      }
    } else {
      setTickets(prev => (prev as Ticket[]).map(t => (t.id === u.id ? ({ ...t, ...u }) as Ticket : t)));
    }
  };

  const handleRemoveTicket = async (ticketID: string | null | undefined) => {
    if (!ticketID) return;
    const ok = window.confirm("Delete this ticket? This cannot be undone.");
    if (!ok) return;
    try {
      await removeTicket(ticketID);
      setTickets(prev => (prev as Ticket[]).filter(t => t.id !== ticketID));
    } catch (err) {
      console.error('Error removing ticket:', err);
      window.alert("Failed to delete the ticket. Please try again.");
    }
  };

  const handleRetryFetch = () => setFetchRetry(c => c + 1);

  const handleChangeSort = (next: SortType) => {
    const sp = new URLSearchParams(location.search);
    sp.set("sort", String(next));
    setSearchParams(sp, { replace: true });
    setSortType(next);
    if (ticketCollectionId) updateSortType(ticketCollectionId, next).catch(() => {});
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
        onChangeSort={handleChangeSort}
        onSignOut={handleSignOut}
      />
      <main className="bg-background min-h-screen">
        <Outlet
          context={
            {
              tickets,
              isLoading,
              isMobile,
              fetchError,
              onRetryFetch: handleRetryFetch,
              handleAddTicket,
              handleEditTicket,
              handleRemoveTicket,
              ticketCollection: ticketCollectionId,
              onChangeSort: handleChangeSort,
            } satisfies AppOutletContext
          }
        />
      </main>
    </>
  );
};

export default AppShell;
