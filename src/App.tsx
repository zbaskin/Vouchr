import './App.css';
import { useEffect, useState } from 'react';

import { generateClient } from 'aws-amplify/api';

import { createTicket, createTicketCollection, createUser } from './graphql/mutations';
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
  user: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [formState, setFormState] = useState<CreateTicketInput>(initialState);
  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [ticketCollection] = useState(user.userId); 
  
  useEffect(() => {
    fetchUser();
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      const ticketData = await client.graphql({
        query: ticketsByTicketsID,
        variables: {
          ticketsID: ticketCollection,
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

  async function fetchUser() {
    try {
      const userData = await client.graphql({
        query: getUser,
        variables: {
          id: user.userId,
        }
      });
      //const ticketCollection = userData.data.getUser?.userTicketsId ? userData.data.getUser.userTicketsId : '';
      //setTicketCollection(ticketCollection);
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
            "id": user.userId,
            "username": user.username,
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
            "id": user.userId,
          }
        }
      });
      //const ticketCollection = ticketCollectionData.data.createTicketCollection.id;
      //setTicketCollection(ticketCollection);
    } catch (err) {
      console.log('error creating collection:', err);
    }
  }

  return (
    <div className="container">
      <Heading level={1}>Hello {user?.username}</Heading>
      <Button onClick={signOut}>Sign out</Button>

      <h2>Ticket Collection</h2>
      <input
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value, ticketsID: ticketCollection })
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
        </div>
      ))}
    </div>
  );
};

export default withAuthenticator(App);
