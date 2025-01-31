import './App.css';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

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
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());
  
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

  const handleUpdateSort = async (collectionSortType: SortType) => {
    if (!ticketCollection) return;
    await updateSortType(ticketCollection, collectionSortType);
    await handleFetchTickets();
  }

  const handleAddTicket = async () => {
    if (!formState.name || !formState.type) return;
    const ticket = { ...formState };
    ticket.ticketsID = ticketCollection as string;
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

  const clearTime = (date: Date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  return (
    <div className="appContainer">
      <h2>{user?.username ? user.username.concat("'s") : (<h2>Your</h2>) } Ticket Collection</h2>
      <div className="headerButtonContainer">
        <Button onClick={signOut}>Sign out</Button>
        <button className="createTicketButton" onClick={handleAddTicket}>
          Create Ticket
        </button>
      </div>
      <div className="ticketInputContainer">
        <input
          onChange={(event) => 
            setFormState({ 
              ...formState, 
              name: event.target.value,
            })
          }
          className="ticketInput"
          value={formState.name}
          placeholder="Movie Name"
        />
        <input
          onChange={(event) => 
            setFormState({ 
              ...formState, 
              venue: event.target.value,
            })
          }
          className="ticketInput"
          value={formState.venue || ""}
          placeholder="Theater Name"
        />
        <div className="ticketInputSmall">
          <DatePicker
            className="ticketInput" 
            selected={eventDate}
            maxDate={new Date()}
            onChange={(event) => {
              if (!event) return;
              const date = event;
              clearTime(date);
              setEventDate(date);
            }}
          />
          <DatePicker
            className="ticketInput" 
            selected={eventTime}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={5}
            dateFormat="h:mm aa"
            onChange={(event) => {
              if (!event) return;
              const time = event;
              setEventTime(time);
              console.log(time);
            }}
          />
        </div>
        <div className="ticketInputSmall">
          <input
            onChange={(event) => 
              setFormState({ 
                ...formState, 
                theater: event.target.value,
              })
            }
            className="ticketInput"
            value={formState.theater || ""}
            placeholder="Room"
          />
          <input
            onChange={(event) => 
              setFormState({ 
                ...formState, 
                seat: event.target.value,
              })
            }
            className="ticketInput"
            value={formState.seat || ""}
            placeholder="Seat"
          />
        </div>
      </div>
      <div className="sortButtonContainer">
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
            <div key={ticket.id ? ticket.id : index} className="ticketObject">
              <button className="removeTicketButton" onClick={()=>handleRemoveTicket(ticket.id)}>X</button>
              <p className="ticketProperty">{ticket.name}</p>
              <p className="ticketProperty">{ticket.venue}</p>
              <p className="ticketProperty">{ticket.eventDate}</p>
              <p className="ticketProperty">{ticket.eventTime}</p>
              <p className="ticketProperty">{ticket.theater}</p>
              <p className="ticketProperty">{ticket.seat}</p>
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
