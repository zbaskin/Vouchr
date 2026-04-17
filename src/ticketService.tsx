// ticketService.tsx — schema-aligned, owner-safe

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
// You can keep using generated mutations if they exist & are up to date:
import {
  createTicket as createTicketMutation,
  createTicketCollection as createTicketCollectionMutation,
  // createUser as createUserMutation,
  deleteTicket as deleteTicketMutation,
  updateTicketCollection as updateTicketCollectionMutation,
  updateTicket as updateTicketMutation,
  // updateUser as updateUserMutation,
} from './graphql/mutations';
import { SortType, UpdateTicketInput, Ticket, Visibility, CreateTicketInput } from './API';
import { getTicketCollection, ticketsByTicketsID } from './graphql/queries';
import { computeNextCount } from './utils/ticketCount';

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
/*
// Replaces stale getUser that asked for userTicketsId (which no longer exists).
const GET_USER = /\* GraphQL *\/ `
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
*/
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

// Only return scalar fields; do NOT select `Tickets` here
const CREATE_USER_LITE = /* GraphQL */ `
  mutation CreateUserLite($input: CreateUserInput!, $condition: ModelUserConditionInput) {
    createUser(input: $input, condition: $condition) {
      id
      owner
      username
      isProfilePublic
      ticketsCollectionId
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER_LITE = /* GraphQL */ `
  mutation UpdateUserLite($input: UpdateUserInput!, $condition: ModelUserConditionInput) {
    updateUser(input: $input, condition: $condition) {
      id
      owner
      username
      isProfilePublic
      ticketsCollectionId
      createdAt
      updatedAt
    }
  }
`;

/* ----------------------------- READS ----------------------------- */

export function filterTicketItems(items: Array<unknown> | null | undefined): unknown[] {
  return (items ?? []).filter(Boolean);
}

export async function fetchTickets(ticketCollectionId: string) {
  const mode = await readMode(false);
  const all: unknown[] = [];
  let nextToken: string | null = null;
  do {
    const res = (await client.graphql({
      authMode: mode,
      query: ticketsByTicketsID,
      variables: { ticketsID: ticketCollectionId, nextToken },
    })) as unknown as Record<string, unknown>;
    if (!('data' in res)) {
      throw new Error('Unexpected subscription result for a query');
    }
    const page = (res.data as { ticketsByTicketsID: { items: unknown[]; nextToken: string | null } | null }).ticketsByTicketsID;
    all.push(...filterTicketItems(page?.items));
    nextToken = page?.nextToken ?? null;
  } while (nextToken);
  return all as Ticket[];
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
      query: GET_USER_LITE,
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
  const owner = await currentSub();
  const now = Math.floor(Date.now() / 1000);
  const res = await client.graphql({
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
        rating: t.rating ?? null,
        notes: t.notes ?? null,
      },
    },
  });
  const created = res.data.createTicket!;
  try {
    await adjustTicketCount(t.ticketsID!, +1);
  } catch (err) {
    console.error('Warning: ticket created but ticketCount sync failed (non-fatal):', err);
  }
  return created;
}

export async function removeTicket(ticketID: string) {
  const res = await client.graphql({
    authMode: 'userPool',
    query: deleteTicketMutation,
    variables: { input: { id: ticketID } },
  });
  const t = res.data?.deleteTicket?.ticketsID;
  if (!t) return;
  try {
    await adjustTicketCount(t, -1);
  } catch (err) {
    console.error('Warning: ticket deleted but ticketCount sync failed (non-fatal):', err);
  }
}


/** Create a User row and link to an existing/new collection */
/*
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
*/

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
    query: UPDATE_USER_LITE,
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
      query: CREATE_USER_LITE,
      variables: { input: { 
        id: owner, 
        owner, 
        username, 
        isProfilePublic: false 
      } },
    });
    if (!('data' in res)) throw new Error('Unexpected subscription result');
  } catch (e: unknown) {
    // If another render/thread already created the user, ignore the conditional error.
    const msg = String((e as { message?: string })?.message ?? e);
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

export async function adjustTicketCount(
  collectionId: string,
  delta: number,
  maxRetries = 3
): Promise< number | null > {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const read = await client.graphql({
      authMode: 'userPool',
      query: getTicketCollection,
      variables: { id: collectionId },
    });
    if (!('data' in read)) throw new Error('Unexpected subscription result');

    const curr = read.data.getTicketCollection;
    if (!curr) return null;

    const next = computeNextCount(curr.ticketCount, delta);

    try {
      const write = await client.graphql({
        authMode: 'userPool',
        query: updateTicketCollectionMutation,
        variables: {
          input: {
            id: collectionId,
            ticketCount: next,
          },
        },
      });
      if (!('data' in write)) throw new Error('Unexpected subscription result');
      return write.data.updateTicketCollection?.ticketCount ?? next;
    } catch (e: unknown) {
      const msg = String((e as { errors?: { message?: string }[]; message?: string })?.errors?.[0]?.message ?? (e as { message?: string })?.message ?? e);
      if (msg.includes('Conflict') || msg.includes('ConditionalCheckFailed')) {
        await new Promise(r => setTimeout(r, 50 + attempt * 100));
        continue;
      }
      throw e;
    }
  }
  return null;
}