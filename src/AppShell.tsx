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
import { normalizeSort, sortTickets } from "./utils/sort";
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
    id: string; name: string; venue: string; eventDate: string; eventTime: string; theater: string; seat: string; type?: string; rating?: number | null; notes?: string | null;
  }) => Promise<void>;
  onChangeSort: (sort: SortType) => void;
};


function useMediaQuery(query: string) {
  const get = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
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
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootRetry, setBootRetry] = useState(0);
  const bootRef = useRef(false);

  const { authStatus, user } = useAuthenticator((ctx) => [ctx.authStatus, ctx.user]);
  const authReady = authStatus === "authenticated" && !!user;

  const isMobile = useMediaQuery("(max-width: 767px)");

  // ✅ one-time bootstrap: ensure User + TicketCollection exist and capture the collection id
  useEffect(() => {
    if (!authReady || bootRef.current || !user?.userId) return;
    bootRef.current = true;

    (async () => {
      try {
        const u = await ensureUser(user.username as string);
        if (!u) return;
        let collId = u.ticketsCollectionId as string | undefined;
        if (!collId) {
          collId = await createCollection();
          try { await linkUserToCollection(u.id, collId); }
          catch (e: unknown) {
            const msg = String((e as { message?: string })?.message ?? e);
            if (!msg.includes('ConditionalCheckFailed')) throw e;
            const latest = await fetchUser(u.id);
            collId = latest?.ticketsCollectionId ?? collId;
          }
        }
        setTicketCollectionId(collId);
      } catch (err) {
        bootRef.current = false; // allow retry
        console.error('Bootstrap error:', err);
        setBootError('Something went wrong loading your account. Please try again.');
      }
    })();
  }, [authReady, user?.userId, user?.username, bootRetry]);

  // ✅ init sort from URL or server, once the collection id is known
  useEffect(() => {
    if (!authReady || !ticketCollectionId) return;
    (async () => {
      // URL has priority — no async work needed
      const urlSort = normalizeSort(searchParams.get("sort"));
      if (urlSort) {
        setSortType(urlSort);
        updateSortType(ticketCollectionId, urlSort).catch(() => {});
        setSortReady(true);
        return;
      }

      // Use server preference; fallback to TIME_CREATED on any error so
      // tickets always load even when the sort preference fetch fails.
      let effective = SortType.TIME_CREATED;
      try {
        const serverSort = await fetchSortType(ticketCollectionId);
        effective = serverSort ?? SortType.TIME_CREATED;
      } catch (err) {
        console.error('Could not fetch sort preference — defaulting to TIME_CREATED:', err);
      }
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
    // sortType intentionally omitted: sort changes are applied in-memory via handleChangeSort
    // to avoid a redundant network round-trip. The initial fetch still reads sortType via closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, ticketCollectionId, sortReady, fetchRetry]);

  /* ---------- actions ---------- */

  // ✅ ensure ticketsID is set to the current collection id before calling addTicket
  const handleAddTicket = async (newTicket: CreateTicketInput) => {
    if (!newTicket.name) return;
    if (!ticketCollectionId) throw new Error("Your ticket collection isn't ready yet. Please try again in a moment.");
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
    if (!u?.id) throw new Error("Cannot save: ticket is missing an id. Please refresh and try again.");
    await editTicket({
      id: u.id,
      name: u.name,
      venue: u.venue,
      eventDate: u.eventDate,
      eventTime: u.eventTime.length === 5 ? `${u.eventTime}:00` : u.eventTime,
      theater: u.theater,
      seat: u.seat,
      rating: u.rating ?? null,
      notes: u.notes ?? null,
    }); // throws on failure — propagates to TicketEdit
    // Refresh is best-effort; a failure here does not undo the successful edit
    if (ticketCollectionId) {
      try {
        const raw = await fetchTickets(ticketCollectionId);
        setTickets(sortTickets(raw, sortType));
      } catch (err) {
        console.warn('Could not refresh tickets after edit (non-fatal):', err);
        // Optimistically update in-place so the user sees the edit immediately.
        // Use explicit field projection (not { ...t, ...u }) so eventTime is
        // normalized to HH:MM:SS, matching what editTicket() sent to the server.
        setTickets(prev => (prev as Ticket[]).map(t => t.id === u.id ? ({
          ...t,
          name: u.name,
          venue: u.venue,
          eventDate: u.eventDate,
          eventTime: u.eventTime.length === 5 ? `${u.eventTime}:00` : u.eventTime,
          theater: u.theater,
          seat: u.seat,
          rating: u.rating ?? null,
          notes: u.notes ?? null,
        }) : t));
      }
    } else {
      setTickets(prev => (prev as Ticket[]).map(t => t.id === u.id ? ({
        ...t,
        name: u.name,
        venue: u.venue,
        eventDate: u.eventDate,
        eventTime: u.eventTime.length === 5 ? `${u.eventTime}:00` : u.eventTime,
        theater: u.theater,
        seat: u.seat,
      }) : t));
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
    // Re-sort in memory — no network fetch needed when only the order changes
    setTickets(prev => sortTickets(prev as Ticket[], next));
    if (ticketCollectionId) updateSortType(ticketCollectionId, next).catch(() => {});
  };

  const handleSignOut = async () => {
    try {
      await amplifySignOut({ global: false });
    } finally {
      window.location.replace("/");
    }
  };

  if (bootError) {
    return (
      <main className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-copy mb-4">{bootError}</p>
          <button
            onClick={() => { setBootError(null); setBootRetry(c => c + 1); }}
            className="bg-primary text-secondary-content px-4 py-2 rounded cursor-pointer"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

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
        ticketCount={tickets.length}
      />
      <main className="bg-background flex-1">
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
