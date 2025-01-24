import './App.css';
import { useEffect, useState } from 'react';

import { 
  fetchTickets, 
  addTicket, 
  removeTicket, 
  fetchUser, 
  addUser, 
  addTicketCollection,
  fetchSortType,
  updateSortType,
} from './ticketService';

import { 
  type CreateTicketInput, 
  type Ticket,
  EventType, 
  SortType,
} from './API';

import { withAuthenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";

const initialState: CreateTicketInput = { name: '', type: EventType.MOVIE, ticketsID: '', timeCreated: Date.now() };

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [formState, setFormState] = useState<CreateTicketInput>(initialState);
  const [tickets, setTickets] = useState<Ticket[] | CreateTicketInput[]>([]);
  const [ticketCollection] = useState(user?.userId);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    handleFetchUser();
    handleFetchTickets();
  }, []);

  const handleFetchTickets = async () => {
    if (!ticketCollection) return;
    setIsLoading(true);
    const fetchedTickets = await fetchTickets(ticketCollection);
    const sortType = await fetchSortType(ticketCollection);
    if (sortType === SortType.ALPHABETICAL) {
      fetchedTickets.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    }
    if (sortType === SortType.TIME_CREATED) {
      fetchedTickets.sort((a, b) => {
        return b.timeCreated - a.timeCreated;
      });
    }
    setTickets(fetchedTickets);
    setIsLoading(false);
  };

  const handleAddTicket = async () => {
    if (!formState.name || !formState.type) return;
    const ticket = { ...formState, ticketsID: ticketCollection as string };
    ticket.timeCreated = Date.now();
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

  const handleUpdateSort = async (collectionSortType: SortType) => {
    if (!ticketCollection) return;
    await updateSortType(ticketCollection, collectionSortType);
    await handleFetchTickets();
  }

  return (
    <div className="container">
      <div className="signOutButton">
        <Button onClick={signOut}>Sign out</Button>
      </div>
      <h2>{user?.username ? user.username.concat("'s") : (<h2>Your</h2>) } Ticket Collection</h2>
      <div className="formInput">
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
      </div>
      <div className="sortButtons">
        <button className="sortButton" onClick={()=>handleUpdateSort(SortType.ALPHABETICAL)}>
          Sort By Name
        </button>
        <button className="sortButton" onClick={()=>handleUpdateSort(SortType.TIME_CREATED)}>
          Sort By Date Added
        </button>
      </div>
      <div className="ticketCollection">
        {isLoading ? (
          <p>Loading tickets...</p>
        ) : tickets.length > 0 ? (
          tickets.map((ticket, index) => (
            <div key={ticket.id ? ticket.id : index} className="ticket">
              <button className="removeButton" onClick={()=>handleRemoveTicket(ticket.id)}>X</button>
              <p className="ticketName">{ticket.name}</p>
            </div>
          ))
        ) : (
          <p>No tickets available.</p>
        )}
      </div>
    </div>
  );
};

export default withAuthenticator(App);
