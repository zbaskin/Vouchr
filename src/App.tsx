import './App.css';
import { useEffect, useState } from 'react';

import { fetchTickets, addTicket, removeTicket, fetchUser, addUser, addTicketCollection } from './ticketService';

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

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [formState, setFormState] = useState<CreateTicketInput>(initialState);
  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [ticketCollection] = useState(user?.userId); 
  
  useEffect(() => {
    handleFetchUser();
    handleFetchTickets();
  }, []);

  const handleFetchTickets = async () => {
    if (!ticketCollection) return;
    const fetchedTickets = await fetchTickets(ticketCollection);
    setTickets(fetchedTickets);
  };

  const handleAddTicket = async () => {
    if (!formState.name || !formState.type) return;
    const ticket = { ...formState, ticketsID: ticketCollection as string };
    setTickets([...tickets, ticket]);
    setFormState(initialState);
    await addTicket(ticket);
    await handleFetchTickets();
  };

  const handleRemoveTicket = async (ticketID: string | null | undefined) => {
    if (!ticketID) return;
    await removeTicket(ticketID);
    const updatedTickets = tickets.filter((ticket) => ticket.id !== ticketID);
    setTickets(updatedTickets);
  };

  const handleFetchUser = async () => {
    if (!user?.userId) return;
    const userData = await fetchUser(user.userId);
    if (!userData) {
      await addTicketCollection(user.userId);
      await addUser(user.userId, user.username as string, ticketCollection as string);
    }
  };

  return (
    <div className="container">
      <Heading className="greetingHeader" level={1}>Hello {user?.username}</Heading>
      <Button className="signOutButton" onClick={signOut}>Sign out</Button>

      <h2>Ticket Collection!</h2>
      <input
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value, ticketsID: ticketCollection as string })
        }
        className="input"
        value={formState.name}
        placeholder="Name"
      />
      <button className="createButton" onClick={handleAddTicket}>
        Create Ticket
      </button>
      <div className="ticketCollection">
        {tickets.map((ticket, index) => (
          <div key={ticket.id ? ticket.id : index} className="ticket">
            <button className="removeButton" onClick={()=>handleRemoveTicket(ticket.id)}>X</button>
            <p className="ticketName">{ticket.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withAuthenticator(App);
