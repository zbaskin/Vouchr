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

import TicketObject from './components/Ticket';
import TicketForm from './components/TicketForm'

import { 
  type CreateTicketInput, 
  type Ticket,
  SortType,
} from './API';

import { withAuthenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";

type AppProps = {
  signOut?: UseAuthenticator["signOut"]; //() => void;
  user?: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [showForm, setShowForm] = useState(false);
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
    if (sortType === SortType.EVENT_DATE) {
      // FILL SORT LOGIC HERE
    }
    setTickets(fetchedTickets);
    setIsLoading(false);
  };

  const handleUpdateSort = async (collectionSortType: SortType) => {
    if (!ticketCollection) return;
    await updateSortType(ticketCollection, collectionSortType);
    await handleFetchTickets();
  }

  const handleAddTicket = async (newTicket: CreateTicketInput) => {
    if (!newTicket.name || !newTicket.ticketsID) return;
    setTickets((prevTickets) => [...prevTickets, newTicket]);
    await addTicket(newTicket);
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

  const toggleFormDisplay = () => {
    setShowForm(!showForm);
  }

  return (
    <div className="appContainer">
      <h2>{user?.username ? user.username.concat("'s") : (<h2>Your</h2>) } Ticket Collection</h2>
      <div className="headerButtonContainer">
        <Button onClick={signOut}>Sign out</Button>
        <button className="createTicketButton" onClick={toggleFormDisplay}>
          {!showForm ? <span>Create Ticket</span> : <span>Close</span>}
        </button>
      </div>
      {showForm &&
      <TicketForm
        ticketCollection={ticketCollection}
        onAddTicket={handleAddTicket}
      />
      }
      <div className="sortButtonContainer">
        <button className="sortButton" onClick={()=>handleUpdateSort(SortType.ALPHABETICAL)}>
          Sort By Name
        </button>
        <button className="sortButton" onClick={()=>handleUpdateSort(SortType.TIME_CREATED)}>
          Sort By Date Added
        </button>
        <button className="sortButton" onClick={()=>handleUpdateSort(SortType.EVENT_DATE)}>
          Sort By Date Seen
        </button>
      </div>
      <div className="ticketCollection">
        {isLoading ? (
          <p>Loading tickets...</p>
        ) : tickets.length > 0 ? (
          tickets.map((ticket, index) => (
            <TicketObject
              key={ticket.id || index} 
              id={ticket.id || ""} 
              name={ticket.name} 
              venue={ticket.venue || ""}
              eventDate={ticket.eventDate || ""}
              eventTime={ticket.eventTime || ""}
              theater={ticket.theater || ""}
              seat={ticket.seat || ""}
              onRemove={handleRemoveTicket}
            />
          ))
        ) : (
          <p>No tickets available.</p>
        )}
      </div>
    </div>
  );
};

export default withAuthenticator(App);
