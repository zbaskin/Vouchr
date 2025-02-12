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

import TicketForm from './components/TicketForm';
import TicketCollection from './components/TicketCollection';

import { 
  type CreateTicketInput, 
  type Ticket,
  SortType,
} from './API';

import { withAuthenticator } from '@aws-amplify/ui-react';
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
  const [width, setWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(width < 500);
  

  useEffect(() => {
    handleFetchUser();
    handleFetchTickets();
    window.addEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    setWidth(window.innerWidth);
    setIsMobile(window.innerWidth < 500);
  };

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
      fetchedTickets.sort((a, b) => {
        const aDate = a.eventDate || "";
        const bDate = b.eventDate || "";
        const aTime = a.eventTime || "";
        const bTime = b.eventTime || "";
        const [aHour, aMinute] = aTime.substring(0, 5).split(':');
        const [bHour, bMinute] = bTime.substring(0, 5).split(':');
        const aDateTime = new Date(aDate);
        const bDateTime = new Date(bDate);
        aDateTime.setHours(parseInt(aHour));
        aDateTime.setMinutes(parseInt(aMinute));
        bDateTime.setHours(parseInt(bHour));
        bDateTime.setMinutes(parseInt(bMinute));
        return bDateTime.getTime() - aDateTime.getTime();
      });
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
        <button className="signoutButton" onClick={signOut}>Sign out</button>
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
      <TicketCollection 
        tickets={tickets as Ticket[]}
        onRemoveTicket={handleRemoveTicket}
        isLoading={isLoading}
        isMobile={isMobile}
      />
      
    </div>
  );
};

export default withAuthenticator(App);
