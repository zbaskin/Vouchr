/*
import { useEffect, useState } from 'react';

import { generateClient } from 'aws-amplify/api';
import { createTicket, createTicketCollection, createUser, deleteTicket } from './graphql/mutations';
import { ticketsByTicketsID, getUser } from './graphql/queries';

type AppProps = {
    signOut?: UseAuthenticator["signOut"]; //() => void;
    user?: AuthUser;
};

const client = generateClient();

const [formState, setFormState] = useState<CreateTicketInput>(initialState);
const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
const [ticketCollection] = useState(user?.userId); 

export async function fetchTickets() {
    try {
      const ticketData = await client.graphql({
        query: ticketsByTicketsID,
        variables: {
          ticketsID: ticketCollection as string,
        }
      });
      const tickets = ticketData.data.ticketsByTicketsID.items;
      setTickets(tickets);
    } catch (err) {
      console.log('error fetching tickets');
    }
}

export async function addTicket() {
    try {
      if (!formState.name || !formState.type) return;
      const ticket = { ...formState };
      setTickets([...tickets, ticket]);
      setFormState(initialState);
      await client.graphql({
        query: createTicket,
        variables: {
          input: ticket,
        },
      });
      await fetchTickets();
    } catch (err) {
      console.log('error creating ticket:', err);
    }
}

export async function removeTicket(ticketID: string | null | undefined) {
    try {
      if (ticketID === null || ticketID === undefined) return;
      await client.graphql({
        query: deleteTicket,
        variables: {
          input: ({ id: ticketID }),
        },
      });
      await fetchTickets();
      await handleRemoveTicket(ticketID);
    } catch (err) {
      console.log('error removing ticket:', err);
    }
}

export async function handleRemoveTicket(ticketID: string) {
    const updatedTickets = [ ...tickets ];
    updatedTickets.forEach((ticket, index) => {
      if (ticket.id === ticketID) updatedTickets.splice(index, 1);
    });
    setTickets(updatedTickets);
}

export async function fetchUser() {
    try {
      const userData = await client.graphql({
        query: getUser,
        variables: {
          id: user?.userId as string,
        }
      });
      if (!userData.data.getUser) addUser();
    } catch (err) {
      console.log('error fetching user');
      await addUser();
    }
}

export async function addUser() {
    await addTicketCollection();
    try {
      await client.graphql({
        query: createUser,
        variables: {
          input: {
            "id": user?.userId,
            "username": user?.username as string,
            "userTicketsId": ticketCollection,
          }
        }
      });
    } catch (err) {
      console.log('error creating user:', err);
    }
}

export async function addTicketCollection() {
    try {
      await client.graphql({
        query: createTicketCollection,
        variables: {
          input: {
            "id": user?.userId,
          }
        }
      });
    } catch (err) {
      console.log('error creating collection:', err);
    }
}
*/