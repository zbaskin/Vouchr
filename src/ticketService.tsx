// ticketService.tsx — schema-aligned, owner-safe

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
// You can keep using generated mutations if they exist & are up to date:
import {
  createTicket as createTicketMutation,
  createTicketCollection as createTicketCollectionMutation,
  createUser as createUserMutation,
  deleteTicket as deleteTicketMutation,
  updateTicketCollection as updateTicketCollectionMutation,
  updateTicket as updateTicketMutation,
  updateUser as updateUserMutation,
} from './graphql/mutations';
import { SortType, UpdateTicketInput, Ticket, Visibility, CreateTicketInput } from './API';
import { ticketsByTicketsID } from './graphql/queries';

const client = generateClient();

/** Cognito sub (matches identityClaim: "sub") */
async function currentSub(): Promise<string> {
  const { userId } = await getCurrentUser();
  return userId;
}

/** Decide read auth mode (use 'userPool' unless you intentionally want anonymous IAM reads) */
async function readMode(wantPublic = false): Promise<'userPool' | 'iam'> {
  if (wantPublic) return 'iam';
  const s = await fetchAuthSession();
  return s.tokens ? 'userPool' : 'iam';
}

/* ---------- Inline queries that match your new schema ---------- */

// Replaces ticketsByTicketsID (old). Your index is named "byTicketCollection".
/*
const BY_TICKET_COLLECTION = /;* GraphQL *;/ `
  query ByTicketCollection($ticketsID: ID!) {
    byTicketCollection(ticketsID: $ticketsID) {
      items {
        id
        owner
        name
        type
        visibility
        timeCreated
        venue
        theater
        seat
        city
        eventDate
        eventTime
        ticketsID
      }
      nextToken
    }
  }
`;
*/

// Replaces stale getUser that asked for userTicketsId (which no longer exists).
const GET_USER = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      owner
      username
      displayName
      bio
      avatarKey
      isProfilePublic
      ticketsCollectionId
      Tickets {
        id
        title
        description
        visibility
        sort
        ticketCount
      }
    }
  }
`;

// Minimal shape for bootstrap to avoid non-null fields
const GET_USER_LITE = /* GraphQL */ `
  query GetUserLite($id: ID!) {
    getUser(id: $id) {
      id
      ticketsCollectionId
    }
  }
`;

const GET_TICKET_COLLECTION = /* GraphQL */ `
  query GetTicketCollection($id: ID!) {
    getTicketCollection(id: $id) {
      id
      owner
      title
      description
      visibility
      sort
      ticketCount
    }
  }
`;

/* ----------------------------- READS ----------------------------- */

export async function fetchTickets(ticketCollectionId: string) {
  try {
    const mode = await readMode(false);
    const res = await client.graphql({
      authMode: mode,
      query: ticketsByTicketsID,
      variables: { ticketsID: ticketCollectionId },
    });
    if (!('data' in res)) {
      throw new Error('Unexpected subscription result for a query');
    }
    return res.data.ticketsByTicketsID?.items as Ticket[];
  } catch (err) {
    console.error('Error fetching tickets:', err);
    return [];
  }
}

export async function fetchSortType(ticketCollectionId: string) {
  try {
    const res = await client.graphql({
      authMode: 'userPool',
      query: GET_TICKET_COLLECTION,
      variables: { id: ticketCollectionId },
    });
    if (!('data' in res)) {
      throw new Error('Unexpected subscription result for a query');
    }
    return res.data.getTicketCollection?.sort as SortType | null;
  } catch (err) {
    console.error('Error fetching sort type:', err);
    return null;
  }
}

export async function fetchUser(userId: string) {
  try {
    const res = await client.graphql({
      authMode: 'userPool',
      query: GET_USER,
      variables: { id: userId },
    });
    if (!('data' in res)) {
      throw new Error('Unexpected subscription result for a query');
    }
    return res.data.getUser ?? null;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}

/* ---------------------------- WRITES ----------------------------- */

export async function updateSortType(ticketCollectionId: string, sortType: SortType) {
  try {
    await client.graphql({
      authMode: 'userPool',
      query: updateTicketCollectionMutation,
      variables: { input: { id: ticketCollectionId, sort: sortType } },
    });
  } catch (err) {
    console.error('Error updating sort type:', err);
  }
}

export async function addTicket(t: CreateTicketInput) {
  try {
    const owner = await currentSub();
    const now = Math.floor(Date.now() / 1000);
    await client.graphql({
      authMode: 'userPool',
      query: createTicketMutation,
      variables: {
        input: {
          owner,                            // REQUIRED by @auth
          ticketsID: t.ticketsID,           // REQUIRED FK
          name: t.name,                     // REQUIRED
          type: t.type,                     // REQUIRED
          venue: t.venue ?? null,
          theater: t.theater ?? null,
          seat: t.seat ?? null,
          city: t.city ?? null,
          eventDate: t.eventDate ?? null,
          eventTime: t.eventTime ?? null,
          timeCreated: t.timeCreated ?? now,     // REQUIRED (non-null in schema)
          visibility: t.visibility ?? Visibility.PRIVATE, // enum
        },
      },
    });
  } catch (err) {
    console.error('Error adding ticket:', err);
  }
}

export async function removeTicket(ticketID: string) {
  try {
    await client.graphql({
      authMode: 'userPool',
      query: deleteTicketMutation,
      variables: { input: { id: ticketID } },
    });
  } catch (err) {
    console.error('Error removing ticket:', err);
  }
}

/** Create a TicketCollection for the current user.
 *  NOTE: do NOT set id to the user id; let DDB generate it.
 */
export async function addTicketCollection(): Promise<string | null> {
  try {
    const owner = await currentSub();
    const res = await client.graphql({
      authMode: 'userPool',
      query: createTicketCollectionMutation,
      variables: {
        input: {
          owner,                   // REQUIRED
          visibility: Visibility.PRIVATE,   // REQUIRED by TS (enum non-null)
          ticketCount: 0,          // REQUIRED by TS (non-null)
          // title/description/sort are optional
        },
      },
    });
    return res.data.createTicketCollection?.id ?? null;
  } catch (err) {
    console.error('Error adding ticket collection:', err);
    return null;
  }
}

/** Create a User row and link to an existing/new collection */
export async function addUser(username: string, existingCollectionId?: string) {
  try {
    const owner = await currentSub();

    const collectionId = existingCollectionId ?? (await addTicketCollection());
    if (!collectionId) throw new Error('Failed to create TicketCollection');

    await client.graphql({
      authMode: 'userPool',
      query: createUserMutation,
      variables: {
        input: {
          // If you want User.id === sub, include id: owner,
          id: owner,
          owner,                         // REQUIRED
          username,                      // REQUIRED
          isProfilePublic: false,        // required by TS type (Boolean!)
          ticketsCollectionId: collectionId, // correct FK name per schema
        },
      },
    });
    return collectionId;
  } catch (err) {
    console.error('Error adding user:', err);
    return null;
  }
}

export async function editTicket(input: UpdateTicketInput): Promise<Ticket> {
  const res = await client.graphql({
    authMode: 'userPool',
    query: updateTicketMutation,
    variables: { input },
  });
  return res.data.updateTicket as Ticket;
}

export async function linkUserToCollection(userId: string, collectionId: string) {
  const res = await client.graphql({
    authMode: 'userPool',
    query: updateUserMutation,
    variables: { input: { id: userId, ticketsCollectionId: collectionId } },
  });
  if (!('data' in res)) throw new Error('Unexpected subscription result');
  return res.data.updateUser; // optional: return value if you need it
}

/** Create user row if missing (idempotent). Does NOT create a collection. */
export async function ensureUser(username: string) {
  const owner = await currentSub();
  {
    const got = await client.graphql({
      authMode: 'userPool',
      query: GET_USER_LITE,
      variables: { id: owner },
    });
    if (!('data' in got)) throw new Error('Unexpected subscription result');
    if (got.data.getUser) return got.data.getUser;
  }
  try {
    const res = await client.graphql({
      authMode: 'userPool',
      query: createUserMutation,
      variables: { input: { id: owner, owner, username, isProfilePublic: false } },
    });
    if (!('data' in res)) throw new Error('Unexpected subscription result');
  } catch (e: any) {
    // If another render/thread already created the user, ignore the conditional error.
    const msg = String(e?.message ?? e);
    if (!msg.includes('ConditionalCheckFailed')) throw e;
  }
  // Return the fresh user row
  const got2 = await client.graphql({
    authMode: 'userPool',
    query: GET_USER_LITE,
    variables: { id: owner },
  });
  if (!('data' in got2)) throw new Error('Unexpected subscription result');
  return got2.data.getUser;
}

export async function createCollection(): Promise<string> {
  const owner = await currentSub();
  const res = await client.graphql({
    authMode: 'userPool',
    query: createTicketCollectionMutation,
    variables: { input: { owner, visibility: Visibility.PRIVATE, ticketCount: 0 } },
  });
  if (!('data' in res)) throw new Error('Unexpected subscription result');
  return res.data.createTicketCollection!.id!;
}