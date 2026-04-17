/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateUserInput = {
  id?: string | null,
  owner: string,
  username: string,
  displayName?: string | null,
  bio?: string | null,
  avatarKey?: string | null,
  isProfilePublic: boolean,
  ticketsCollectionId?: string | null,
};

export type ModelUserConditionInput = {
  owner?: ModelStringInput | null,
  username?: ModelStringInput | null,
  displayName?: ModelStringInput | null,
  bio?: ModelStringInput | null,
  avatarKey?: ModelStringInput | null,
  isProfilePublic?: ModelBooleanInput | null,
  ticketsCollectionId?: ModelIDInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
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

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
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

export type User = {
  __typename: "User",
  id: string,
  owner: string,
  username: string,
  displayName?: string | null,
  bio?: string | null,
  avatarKey?: string | null,
  isProfilePublic: boolean,
  ticketsCollectionId?: string | null,
  Tickets?: TicketCollection | null,
  createdAt: string,
  updatedAt: string,
};

export type TicketCollection = {
  __typename: "TicketCollection",
  id: string,
  owner: string,
  title?: string | null,
  description?: string | null,
  visibility: Visibility,
  sort?: SortType | null,
  ticketCount: number,
  Tickets?: ModelTicketConnection | null,
  createdAt: string,
  updatedAt: string,
};

export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}


export enum SortType {
  ALPHABETICAL = "ALPHABETICAL",
  EVENT_DATE = "EVENT_DATE",
  EVENT_TYPE = "EVENT_TYPE",
  TIME_CREATED = "TIME_CREATED",
}


export type ModelTicketConnection = {
  __typename: "ModelTicketConnection",
  items:  Array<Ticket | null >,
  nextToken?: string | null,
};

export type Ticket = {
  __typename: "Ticket",
  id: string,
  owner: string,
  name: string,
  type: EventType,
  venue?: string | null,
  theater?: string | null,
  seat?: string | null,
  city?: string | null,
  eventDate?: string | null,
  eventTime?: string | null,
  timeCreated: number,
  ticketsID: string,
  visibility: Visibility,
  rating?: number | null,
  createdAt: string,
  updatedAt: string,
};

export enum EventType {
  MOVIE = "MOVIE",
  CONCERT = "CONCERT",
  SPORT = "SPORT",
  FLIGHT = "FLIGHT",
}


export type UpdateUserInput = {
  id: string,
  owner?: string | null,
  username?: string | null,
  displayName?: string | null,
  bio?: string | null,
  avatarKey?: string | null,
  isProfilePublic?: boolean | null,
  ticketsCollectionId?: string | null,
};

export type DeleteUserInput = {
  id: string,
};

export type CreateTicketCollectionInput = {
  id?: string | null,
  owner: string,
  title?: string | null,
  description?: string | null,
  visibility: Visibility,
  sort?: SortType | null,
  ticketCount: number,
};

export type ModelTicketCollectionConditionInput = {
  owner?: ModelStringInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  visibility?: ModelVisibilityInput | null,
  sort?: ModelSortTypeInput | null,
  ticketCount?: ModelIntInput | null,
  and?: Array< ModelTicketCollectionConditionInput | null > | null,
  or?: Array< ModelTicketCollectionConditionInput | null > | null,
  not?: ModelTicketCollectionConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelVisibilityInput = {
  eq?: Visibility | null,
  ne?: Visibility | null,
};

export type ModelSortTypeInput = {
  eq?: SortType | null,
  ne?: SortType | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type UpdateTicketCollectionInput = {
  id: string,
  owner?: string | null,
  title?: string | null,
  description?: string | null,
  visibility?: Visibility | null,
  sort?: SortType | null,
  ticketCount?: number | null,
};

export type DeleteTicketCollectionInput = {
  id: string,
};

export type CreateTicketInput = {
  id?: string | null,
  owner: string,
  name: string,
  type: EventType,
  venue?: string | null,
  theater?: string | null,
  seat?: string | null,
  city?: string | null,
  eventDate?: string | null,
  eventTime?: string | null,
  timeCreated: number,
  ticketsID: string,
  visibility: Visibility,
  rating?: number | null,
};

export type ModelTicketConditionInput = {
  owner?: ModelStringInput | null,
  name?: ModelStringInput | null,
  type?: ModelEventTypeInput | null,
  venue?: ModelStringInput | null,
  theater?: ModelStringInput | null,
  seat?: ModelStringInput | null,
  city?: ModelStringInput | null,
  eventDate?: ModelStringInput | null,
  eventTime?: ModelStringInput | null,
  timeCreated?: ModelIntInput | null,
  ticketsID?: ModelIDInput | null,
  visibility?: ModelVisibilityInput | null,
  and?: Array< ModelTicketConditionInput | null > | null,
  or?: Array< ModelTicketConditionInput | null > | null,
  not?: ModelTicketConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelEventTypeInput = {
  eq?: EventType | null,
  ne?: EventType | null,
};

export type UpdateTicketInput = {
  id: string,
  owner?: string | null,
  name?: string | null,
  type?: EventType | null,
  venue?: string | null,
  theater?: string | null,
  seat?: string | null,
  city?: string | null,
  eventDate?: string | null,
  eventTime?: string | null,
  timeCreated?: number | null,
  ticketsID?: string | null,
  visibility?: Visibility | null,
  rating?: number | null,
};

export type DeleteTicketInput = {
  id: string,
};

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  owner?: ModelStringInput | null,
  username?: ModelStringInput | null,
  displayName?: ModelStringInput | null,
  bio?: ModelStringInput | null,
  avatarKey?: ModelStringInput | null,
  isProfilePublic?: ModelBooleanInput | null,
  ticketsCollectionId?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelTicketCollectionFilterInput = {
  id?: ModelIDInput | null,
  owner?: ModelStringInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  visibility?: ModelVisibilityInput | null,
  sort?: ModelSortTypeInput | null,
  ticketCount?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelTicketCollectionFilterInput | null > | null,
  or?: Array< ModelTicketCollectionFilterInput | null > | null,
  not?: ModelTicketCollectionFilterInput | null,
};

export type ModelTicketCollectionConnection = {
  __typename: "ModelTicketCollectionConnection",
  items:  Array<TicketCollection | null >,
  nextToken?: string | null,
};

export type ModelTicketFilterInput = {
  id?: ModelIDInput | null,
  owner?: ModelStringInput | null,
  name?: ModelStringInput | null,
  type?: ModelEventTypeInput | null,
  venue?: ModelStringInput | null,
  theater?: ModelStringInput | null,
  seat?: ModelStringInput | null,
  city?: ModelStringInput | null,
  eventDate?: ModelStringInput | null,
  eventTime?: ModelStringInput | null,
  timeCreated?: ModelIntInput | null,
  ticketsID?: ModelIDInput | null,
  visibility?: ModelVisibilityInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelTicketFilterInput | null > | null,
  or?: Array< ModelTicketFilterInput | null > | null,
  not?: ModelTicketFilterInput | null,
};

export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  username?: ModelSubscriptionStringInput | null,
  displayName?: ModelSubscriptionStringInput | null,
  bio?: ModelSubscriptionStringInput | null,
  avatarKey?: ModelSubscriptionStringInput | null,
  isProfilePublic?: ModelSubscriptionBooleanInput | null,
  ticketsCollectionId?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
  owner?: ModelStringInput | null,
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

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionTicketCollectionFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  visibility?: ModelSubscriptionStringInput | null,
  sort?: ModelSubscriptionStringInput | null,
  ticketCount?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTicketCollectionFilterInput | null > | null,
  or?: Array< ModelSubscriptionTicketCollectionFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionTicketFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  type?: ModelSubscriptionStringInput | null,
  venue?: ModelSubscriptionStringInput | null,
  theater?: ModelSubscriptionStringInput | null,
  seat?: ModelSubscriptionStringInput | null,
  city?: ModelSubscriptionStringInput | null,
  eventDate?: ModelSubscriptionStringInput | null,
  eventTime?: ModelSubscriptionStringInput | null,
  timeCreated?: ModelSubscriptionIntInput | null,
  ticketsID?: ModelSubscriptionIDInput | null,
  visibility?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionTicketFilterInput | null > | null,
  or?: Array< ModelSubscriptionTicketFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type CreateUserMutationVariables = {
  input: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    owner: string,
    username: string,
    displayName?: string | null,
    bio?: string | null,
    avatarKey?: string | null,
    isProfilePublic: boolean,
    ticketsCollectionId?: string | null,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
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
    owner: string,
    username: string,
    displayName?: string | null,
    bio?: string | null,
    avatarKey?: string | null,
    isProfilePublic: boolean,
    ticketsCollectionId?: string | null,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
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
    owner: string,
    username: string,
    displayName?: string | null,
    bio?: string | null,
    avatarKey?: string | null,
    isProfilePublic: boolean,
    ticketsCollectionId?: string | null,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null,
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
    owner: string,
    title?: string | null,
    description?: string | null,
    visibility: Visibility,
    sort?: SortType | null,
    ticketCount: number,
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
    owner: string,
    title?: string | null,
    description?: string | null,
    visibility: Visibility,
    sort?: SortType | null,
    ticketCount: number,
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
    owner: string,
    title?: string | null,
    description?: string | null,
    visibility: Visibility,
    sort?: SortType | null,
    ticketCount: number,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateTicketMutationVariables = {
  input: CreateTicketInput,
  condition?: ModelTicketConditionInput | null,
};

export type CreateTicketMutation = {
  createTicket?:  {
    __typename: "Ticket",
    id: string,
    owner: string,
    name: string,
    type: EventType,
    venue?: string | null,
    theater?: string | null,
    seat?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated: number,
    ticketsID: string,
    visibility: Visibility,
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
    owner: string,
    name: string,
    type: EventType,
    venue?: string | null,
    theater?: string | null,
    seat?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated: number,
    ticketsID: string,
    visibility: Visibility,
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
    owner: string,
    name: string,
    type: EventType,
    venue?: string | null,
    theater?: string | null,
    seat?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated: number,
    ticketsID: string,
    visibility: Visibility,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetUserQueryVariables = {
  id: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    owner: string,
    username: string,
    displayName?: string | null,
    bio?: string | null,
    avatarKey?: string | null,
    isProfilePublic: boolean,
    ticketsCollectionId?: string | null,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
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
      owner: string,
      username: string,
      displayName?: string | null,
      bio?: string | null,
      avatarKey?: string | null,
      isProfilePublic: boolean,
      ticketsCollectionId?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type UserByOwnerQueryVariables = {
  owner: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type UserByOwnerQuery = {
  userByOwner?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      owner: string,
      username: string,
      displayName?: string | null,
      bio?: string | null,
      avatarKey?: string | null,
      isProfilePublic: boolean,
      ticketsCollectionId?: string | null,
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
    owner: string,
    title?: string | null,
    description?: string | null,
    visibility: Visibility,
    sort?: SortType | null,
    ticketCount: number,
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
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CollectionsByOwnerQueryVariables = {
  owner: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTicketCollectionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type CollectionsByOwnerQuery = {
  collectionsByOwner?:  {
    __typename: "ModelTicketCollectionConnection",
    items:  Array< {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetTicketQueryVariables = {
  id: string,
};

export type GetTicketQuery = {
  getTicket?:  {
    __typename: "Ticket",
    id: string,
    owner: string,
    name: string,
    type: EventType,
    venue?: string | null,
    theater?: string | null,
    seat?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated: number,
    ticketsID: string,
    visibility: Visibility,
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
      owner: string,
      name: string,
      type: EventType,
      venue?: string | null,
      theater?: string | null,
      seat?: string | null,
      city?: string | null,
      eventDate?: string | null,
      eventTime?: string | null,
      timeCreated: number,
      ticketsID: string,
      visibility: Visibility,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type TicketsByOwnerQueryVariables = {
  owner: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTicketFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TicketsByOwnerQuery = {
  ticketsByOwner?:  {
    __typename: "ModelTicketConnection",
    items:  Array< {
      __typename: "Ticket",
      id: string,
      owner: string,
      name: string,
      type: EventType,
      venue?: string | null,
      theater?: string | null,
      seat?: string | null,
      city?: string | null,
      eventDate?: string | null,
      eventTime?: string | null,
      timeCreated: number,
      ticketsID: string,
      visibility: Visibility,
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
      owner: string,
      name: string,
      type: EventType,
      venue?: string | null,
      theater?: string | null,
      seat?: string | null,
      city?: string | null,
      eventDate?: string | null,
      eventTime?: string | null,
      timeCreated: number,
      ticketsID: string,
      visibility: Visibility,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    owner: string,
    username: string,
    displayName?: string | null,
    bio?: string | null,
    avatarKey?: string | null,
    isProfilePublic: boolean,
    ticketsCollectionId?: string | null,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    owner: string,
    username: string,
    displayName?: string | null,
    bio?: string | null,
    avatarKey?: string | null,
    isProfilePublic: boolean,
    ticketsCollectionId?: string | null,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    owner: string,
    username: string,
    displayName?: string | null,
    bio?: string | null,
    avatarKey?: string | null,
    isProfilePublic: boolean,
    ticketsCollectionId?: string | null,
    Tickets?:  {
      __typename: "TicketCollection",
      id: string,
      owner: string,
      title?: string | null,
      description?: string | null,
      visibility: Visibility,
      sort?: SortType | null,
      ticketCount: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateTicketCollectionSubscriptionVariables = {
  filter?: ModelSubscriptionTicketCollectionFilterInput | null,
  owner?: string | null,
};

export type OnCreateTicketCollectionSubscription = {
  onCreateTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    owner: string,
    title?: string | null,
    description?: string | null,
    visibility: Visibility,
    sort?: SortType | null,
    ticketCount: number,
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
  owner?: string | null,
};

export type OnUpdateTicketCollectionSubscription = {
  onUpdateTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    owner: string,
    title?: string | null,
    description?: string | null,
    visibility: Visibility,
    sort?: SortType | null,
    ticketCount: number,
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
  owner?: string | null,
};

export type OnDeleteTicketCollectionSubscription = {
  onDeleteTicketCollection?:  {
    __typename: "TicketCollection",
    id: string,
    owner: string,
    title?: string | null,
    description?: string | null,
    visibility: Visibility,
    sort?: SortType | null,
    ticketCount: number,
    Tickets?:  {
      __typename: "ModelTicketConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateTicketSubscriptionVariables = {
  filter?: ModelSubscriptionTicketFilterInput | null,
  owner?: string | null,
};

export type OnCreateTicketSubscription = {
  onCreateTicket?:  {
    __typename: "Ticket",
    id: string,
    owner: string,
    name: string,
    type: EventType,
    venue?: string | null,
    theater?: string | null,
    seat?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated: number,
    ticketsID: string,
    visibility: Visibility,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateTicketSubscriptionVariables = {
  filter?: ModelSubscriptionTicketFilterInput | null,
  owner?: string | null,
};

export type OnUpdateTicketSubscription = {
  onUpdateTicket?:  {
    __typename: "Ticket",
    id: string,
    owner: string,
    name: string,
    type: EventType,
    venue?: string | null,
    theater?: string | null,
    seat?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated: number,
    ticketsID: string,
    visibility: Visibility,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteTicketSubscriptionVariables = {
  filter?: ModelSubscriptionTicketFilterInput | null,
  owner?: string | null,
};

export type OnDeleteTicketSubscription = {
  onDeleteTicket?:  {
    __typename: "Ticket",
    id: string,
    owner: string,
    name: string,
    type: EventType,
    venue?: string | null,
    theater?: string | null,
    seat?: string | null,
    city?: string | null,
    eventDate?: string | null,
    eventTime?: string | null,
    timeCreated: number,
    ticketsID: string,
    visibility: Visibility,
    createdAt: string,
    updatedAt: string,
  } | null,
};
