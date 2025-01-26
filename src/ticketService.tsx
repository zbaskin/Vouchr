import { generateClient } from 'aws-amplify/api';
import { 
  createTicket, 
  createTicketCollection, 
  createUser, 
  deleteTicket, 
  updateTicketCollection, 
} from './graphql/mutations';
import { ticketsByTicketsID, getUser, getTicketCollection } from './graphql/queries';
import { SortType } from './API'

const client = generateClient();

// Fetch tickets by collection ID
export async function fetchTickets(ticketCollection: string) {
  try {
    const ticketData = await client.graphql({
      query: ticketsByTicketsID,
      variables: { ticketsID: ticketCollection },
    });
    return ticketData.data.ticketsByTicketsID.items;
  } catch (err) {
    console.error('Error fetching tickets:', err);
    return [];
  }
}

// Fetch sort type of Ticket Collection
export async function fetchSortType(ticketCollection: string) {
  try {
    const collectionData = await client.graphql({
      query: getTicketCollection,
      variables: { id: ticketCollection },
    });
    return collectionData.data.getTicketCollection?.sort;
  } catch (err) {
    console.error('Error fetching sort type:', err);
    return;
  }
}

// Update sort type of Ticket Collection
export async function updateSortType(ticketCollection: string, sortType: SortType) {
  try {
    await client.graphql({
      query: updateTicketCollection,
      variables: { input: { id: ticketCollection, sort: sortType } },
    });
  } catch (err) {
    console.error('Error updating sort type:', err);
    return;
  }
}

// Add a ticket
export async function addTicket(ticket: any) {
  try {
    await client.graphql({
      query: createTicket,
      variables: { input: ticket },
    });
  } catch (err) {
    console.error('Error adding ticket:', err);
  }
}

// Remove a ticket
export async function removeTicket(ticketID: string) {
  try {
    await client.graphql({
      query: deleteTicket,
      variables: { input: { id: ticketID } },
    });
  } catch (err) {
    console.error('Error removing ticket:', err);
  }
}

// Fetch user details
export async function fetchUser(userId: string) {
  try {
    const userData = await client.graphql({
      query: getUser,
      variables: { id: userId },
    });
    return userData.data.getUser;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}

// Add a new user
export async function addUser(userId: string, username: string, ticketCollection: string) {
  try {
    await client.graphql({
      query: createUser,
      variables: {
        input: {
          id: userId,
          username,
          userTicketsId: ticketCollection,
        },
      },
    });
  } catch (err) {
    console.error('Error adding user:', err);
  }
}

// Add a new ticket collection
export async function addTicketCollection(userId: string) {
  try {
    await client.graphql({
      query: createTicketCollection,
      variables: { input: { id: userId } },
    });
  } catch (err) {
    console.error('Error adding ticket collection:', err);
  }
}
