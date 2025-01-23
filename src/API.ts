/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTicketInput = {
  id?: string | null,
  name: string,
  type: EventType,
  seat?: string | null,
  venue?: string | null,
  city?: string | null,
  eventDate?: string | null,
  eventTime?: string | null,
  timeCreated?: string | null,
  ticketsID: string,
};

export enum EventType {
  MOVIE = "MOVIE",
  CONCERT = "CONCERT",
  SPORT = "SPORT",
  FLIGHT = "FLIGHT",
}


export type ModelTicketConditionInput = {
  name?: ModelStringInput | null,
  type?: ModelEventTypeInput | null,
  seat?: ModelStringInput | null,
  venue?: ModelStringInput | null,
  city?: ModelStringInput | null,
  eventDate?: ModelStringInput | null,
  eventTime?: ModelStringInput | null,
  timeCreated?: ModelStringInput | null,
  ticketsID?: ModelIDInput | null,
  and?: Array< ModelTicketConditionInput | null > | null,
  or?: Array< ModelTicketConditionInput | null > | null,
  not?: ModelTicketConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelEventTypeInput = {
  eq?: EventType | null,
  ne?: EventType | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type Ticket = {
  __typename: "Ticket",
  id: string,
  name: string,
  type: EventType,
  seat?: string | null,
  venue?: string | null,
  city?: string | null,
  eventDate?: string | null,
  eventTime?: string | null,
  timeCreated?: string | null,
  ticketsID: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateTicketInput = {
  id: string,
  name?: string | null,
  type?: EventType | null,
  seat?: string | null,
  venue?: string | null,
  city?: string | null,
  eventDate?: string | null,
  eventTime?: string | null,
  timeCreated?: string | null,
  ticketsID?: string | null,
};

export type DeleteTicketInput = {
  id: string,
};

export type CreateTicketCollectionInput = {
  id?: string | null,
};

export type ModelTicketCollectionConditionInput = {
  and?: Array< ModelTicketCollectionConditionInput | null > | null,
  or?: Array< ModelTicketCollectionConditionInput | null > | null,
  not?: ModelTicketCollectionConditionInput | null,
};

export type TicketCollection = {
  __typename: "TicketCollection",
  id: string,
  Tickets?: ModelTicketConnection | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelTicketConnection = {
  __typename: "ModelTicketConnection",
  items:  Array<Ticket | null >,
  nextToken?: string | null,
};

export type UpdateTicketCollectionInput = {
  id: string,
};

export type DeleteTicketCollectionInput = {
  id: string,
};

export type CreateUserInput = {
  id?: string | null,
  username: string,
  userTicketsId?: string | null,
};

export type ModelUserConditionInput = {
  username?: ModelStringInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
  userTicketsId?: ModelIDInput | null,
};

export type User = {
  __typename: "User",
  id: string,
  username: string,
  Tickets?: TicketCollection | null,
  createdAt: string,
  updatedAt: string,
  userTicketsId?: string | null,
};

export type UpdateUserInput = {
  id: string,
  username?: string | null,
  userTicketsId?: string | null,
};

export type DeleteUserInput = {
  id: string,
};

export type ModelTicketFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  type?: ModelEventTypeInput | null,
  seat?: ModelStringInput | null,
  venue?: ModelStringInput | null,
  city?: ModelStringInput | null,
  eventDate?: ModelStringInput | null,
  eventTime?: ModelStringInput | null,
  timeCreated?: ModelStringInput | null,
  ticketsID?: ModelIDInput | null,
  and?: Array< ModelTicketFilterInput | null > | null,
  or?: Array< ModelTicketFilterInput | null > | null,
  not?: ModelTicketFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelTicketCollectionFilterInput = {
  id?: ModelIDInput | null,
  and?: Array< ModelTicketCollectionFilterInput | null > | null,
  or?: Array< ModelTicketCollectionFilterInput | null > | null,
  not?: ModelTicketCollectionFilterInput | null,
};

export type ModelTicketCollectionConnection = {
  __typename: "ModelTicketCollectionConnection",
  items:  Array<TicketCollection | null >,
  nextToken?: string | null,
};

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  username?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
  userTicketsId?: ModelIDInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionTicketFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  type?: ModelSubscriptionStringInput | null,
  seat?: ModelSubscriptionStringInput | null,
  venue?: ModelSubscriptionStringInput | null,
  city?: ModelSubscriptionStringInput | null,
  eventDate?: ModelSubscriptionStringInput | null,
  eventTime?: ModelSubscriptionStringInput | null,
  timeCreated?: ModelSubscriptionStringInput | null,
  ticketsID?: ModelSubscriptionIDInput | null,
  and?: Array< ModelSubscriptionTicketFilterInput | null > | null,
  or?: Array< ModelSubscriptionTicketFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionTicketCollectionFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  and?: Array< ModelSubscriptionTicketCollectionFilterInput | null > | null,
  or?: Array< ModelSubscriptionTicketCollectionFilterInput | null > | null,
};

export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  username?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
};

export type CreateTicketMutationVariables = {
  input: CreateTicketInput,
  condition?: ModelTicketConditionInput | null,
};

export type CreateTicketMutation = {
  createTicket?:  {
    __typename: "Ticket",
    id: string,
    name: string,
    type: EventType,
    seat?: string | null,
    venue?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated?: string | null,
    ticketsID: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateTicketMutationVariables = {
  input: UpdateTicketInput,
  condition?: ModelTicketConditionInput | null,
};

export type UpdateTicketMutation = {
  updateTicket?:  {
    __typename: "Ticket",
    id: string,
    name: string,
    type: EventType,
    seat?: string | null,
    venue?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated?: string | null,
    ticketsID: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteTicketMutationVariables = {
  input: DeleteTicketInput,
  condition?: ModelTicketConditionInput | null,
};

export type DeleteTicketMutation = {
  deleteTicket?:  {
    __typename: "Ticket",
    id: string,
    name: string,
    type: EventType,
    seat?: string | null,
    venue?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated?: string | null,
    ticketsID: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateTicketCollectionMutationVariables = {
  input: CreateTicketCollectionInput,
  condition?: ModelTicketCollectionConditionInput | null,
};

export type CreateTicketCollectionMutation = {
  createTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateTicketCollectionMutationVariables = {
  input: UpdateTicketCollectionInput,
  condition?: ModelTicketCollectionConditionInput | null,
};

export type UpdateTicketCollectionMutation = {
  updateTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteTicketCollectionMutationVariables = {
  input: DeleteTicketCollectionInput,
  condition?: ModelTicketCollectionConditionInput | null,
};

export type DeleteTicketCollectionMutation = {
  deleteTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateUserMutationVariables = {
  input: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    username: string,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
    userTicketsId?: string | null,
  } | null,
};

export type UpdateUserMutationVariables = {
  input: UpdateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type UpdateUserMutation = {
  updateUser?:  {
    __typename: "User",
    id: string,
    username: string,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
    userTicketsId?: string | null,
  } | null,
};

export type DeleteUserMutationVariables = {
  input: DeleteUserInput,
  condition?: ModelUserConditionInput | null,
};

export type DeleteUserMutation = {
  deleteUser?:  {
    __typename: "User",
    id: string,
    username: string,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
    userTicketsId?: string | null,
  } | null,
};

export type GetTicketQueryVariables = {
  id: string,
};

export type GetTicketQuery = {
  getTicket?:  {
    __typename: "Ticket",
    id: string,
    name: string,
    type: EventType,
    seat?: string | null,
    venue?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated?: string | null,
    ticketsID: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListTicketsQueryVariables = {
  filter?: ModelTicketFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTicketsQuery = {
  listTickets?:  {
    __typename: "ModelTicketConnection",
    items:  Array< {
      __typename: "Ticket",
      id: string,
      name: string,
      type: EventType,
      seat?: string | null,
      venue?: string | null,
      city?: string | null,
      eventDate?: string | null,
      eventTime?: string | null,
      timeCreated?: string | null,
      ticketsID: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type TicketsByTicketsIDQueryVariables = {
  ticketsID: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTicketFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TicketsByTicketsIDQuery = {
  ticketsByTicketsID?:  {
    __typename: "ModelTicketConnection",
    items:  Array< {
      __typename: "Ticket",
      id: string,
      name: string,
      type: EventType,
      seat?: string | null,
      venue?: string | null,
      city?: string | null,
      eventDate?: string | null,
      eventTime?: string | null,
      timeCreated?: string | null,
      ticketsID: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetTicketCollectionQueryVariables = {
  id: string,
};

export type GetTicketCollectionQuery = {
  getTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListTicketCollectionsQueryVariables = {
  filter?: ModelTicketCollectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTicketCollectionsQuery = {
  listTicketCollections?:  {
    __typename: "ModelTicketCollectionConnection",
    items:  Array< {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetUserQueryVariables = {
  id: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    username: string,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
    userTicketsId?: string | null,
  } | null,
};

export type ListUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUsersQuery = {
  listUsers?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      username: string,
      createdAt: string,
      updatedAt: string,
      userTicketsId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateTicketSubscriptionVariables = {
  filter?: ModelSubscriptionTicketFilterInput | null,
};

export type OnCreateTicketSubscription = {
  onCreateTicket?:  {
    __typename: "Ticket",
    id: string,
    name: string,
    type: EventType,
    seat?: string | null,
    venue?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated?: string | null,
    ticketsID: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTicketSubscriptionVariables = {
  filter?: ModelSubscriptionTicketFilterInput | null,
};

export type OnUpdateTicketSubscription = {
  onUpdateTicket?:  {
    __typename: "Ticket",
    id: string,
    name: string,
    type: EventType,
    seat?: string | null,
    venue?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated?: string | null,
    ticketsID: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTicketSubscriptionVariables = {
  filter?: ModelSubscriptionTicketFilterInput | null,
};

export type OnDeleteTicketSubscription = {
  onDeleteTicket?:  {
    __typename: "Ticket",
    id: string,
    name: string,
    type: EventType,
    seat?: string | null,
    venue?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated?: string | null,
    ticketsID: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateTicketCollectionSubscriptionVariables = {
  filter?: ModelSubscriptionTicketCollectionFilterInput | null,
};

export type OnCreateTicketCollectionSubscription = {
  onCreateTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTicketCollectionSubscriptionVariables = {
  filter?: ModelSubscriptionTicketCollectionFilterInput | null,
};

export type OnUpdateTicketCollectionSubscription = {
  onUpdateTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTicketCollectionSubscriptionVariables = {
  filter?: ModelSubscriptionTicketCollectionFilterInput | null,
};

export type OnDeleteTicketCollectionSubscription = {
  onDeleteTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    username: string,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
    userTicketsId?: string | null,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    username: string,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
    userTicketsId?: string | null,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    username: string,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
    userTicketsId?: string | null,
  } | null,
};
