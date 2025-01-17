import './App.css';
import { useEffect, useState } from 'react';

import { generateClient } from 'aws-amplify/api';

import { createTicket, createTicketCollection, createUser, deleteTicket } from './graphql/mutations';
import { ticketsByTicketsID, getUser } from './graphql/queries';
import { 
  type CreateTicketInput, 
  type Ticket,
  EventType, 
} from './API';

import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";

const initialState: CreateTicketInput = { name: '', type: EventType.MOVIE, ticketsID: '' };
const client = generateClient();

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [formState, setFormState] = useState<CreateTicketInput>(initialState);
  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [ticketCollection] = useState(user?.userId); 
  
  useEffect(() => {
    fetchUser();
    fetchTickets();
  }, []);

  async function fetchTickets() {
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

  async function addTicket() {
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
    } catch (err) {
      console.log('error creating ticket:', err);
    }
  }

  async function removeTicket(ticketID: string | null | undefined) {
    try {
      if (!formState.name || !formState.type || ticketID === null || ticketID === undefined) return;
      await client.graphql({
        query: deleteTicket,
        variables: {
          input: ({ id: ticketID }),
        },
      });
      handleRemoveTicket(ticketID);
    } catch (err) {
      console.log('error removing ticket:', err);
    }
  }

  function handleRemoveTicket(ticketID: string) {
    const updatedTickets = { ...tickets };
    console.log(updatedTickets);
    updatedTickets.filter(
      (ticket) => {
        ticket.name !== ticketID
      }
    );
    console.log(updatedTickets);
    setTickets(updatedTickets);
    
    
    /*const updatedTickets = Object.fromEntries(
      Object.entries().filter()
    );

    const removeEntriesByCategory = (category: string) => {
      setTickets((prevEntries) => {
        const updatedEntries = Object.fromEntries(
          Object.entries(prevEntries).filter(
            ([, ticket]) => ticket.id !== ticketID
          )
        );
        return updatedEntries;
      });
    };*/

    /*const updatedTickets = { ...tickets };
    delete updatedTickets[0];
    setTickets(updatedTickets);*/
  }

  async function fetchUser() {
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

  async function addUser() {
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

  async function addTicketCollection() {
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

  return (
    <div className="container">
      <Heading level={1}>Hello {user?.username}</Heading>
      <Button onClick={signOut}>Sign out</Button>

      <h2>Ticket Collection!</h2>
      <input
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value, ticketsID: ticketCollection as string })
        }
        className="input"
        value={formState.name}
        placeholder="Name"
      />
      <button className="createButton" onClick={addTicket}>
        Create Ticket
      </button>
      {tickets.map((ticket, index) => (
        <div key={ticket.id ? ticket.id : index} className="ticket">
          <p className="ticketName">{ticket.name}</p>
          <button onClick={()=>removeTicket(ticket.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default withAuthenticator(App);
