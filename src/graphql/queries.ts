/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getUser = /* GraphQL */ `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    owner
    username
    displayName
    bio
    avatarKey
    isProfilePublic
    ticketsCollectionId
    Tickets {
      id
      owner
      title
      description
      visibility
      sort
      ticketCount
      createdAt
      updatedAt
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetUserQueryVariables, APITypes.GetUserQuery>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      owner
      username
      displayName
      bio
      avatarKey
      isProfilePublic
      ticketsCollectionId
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
export const userByOwner = /* GraphQL */ `query UserByOwner(
  $owner: String!
  $sortDirection: ModelSortDirection
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  userByOwner(
    owner: $owner
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      owner
      username
      displayName
      bio
      avatarKey
      isProfilePublic
      ticketsCollectionId
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.UserByOwnerQueryVariables,
  APITypes.UserByOwnerQuery
>;
export const getTicketCollection = /* GraphQL */ `query GetTicketCollection($id: ID!) {
  getTicketCollection(id: $id) {
    id
    owner
    title
    description
    visibility
    sort
    ticketCount
    Tickets {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTicketCollectionQueryVariables,
  APITypes.GetTicketCollectionQuery
>;
export const listTicketCollections = /* GraphQL */ `query ListTicketCollections(
  $filter: ModelTicketCollectionFilterInput
  $limit: Int
  $nextToken: String
) {
  listTicketCollections(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      owner
      title
      description
      visibility
      sort
      ticketCount
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTicketCollectionsQueryVariables,
  APITypes.ListTicketCollectionsQuery
>;
export const collectionsByOwner = /* GraphQL */ `query CollectionsByOwner(
  $owner: String!
  $sortDirection: ModelSortDirection
  $filter: ModelTicketCollectionFilterInput
  $limit: Int
  $nextToken: String
) {
  collectionsByOwner(
    owner: $owner
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      owner
      title
      description
      visibility
      sort
      ticketCount
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.CollectionsByOwnerQueryVariables,
  APITypes.CollectionsByOwnerQuery
>;
export const getTicket = /* GraphQL */ `query GetTicket($id: ID!) {
  getTicket(id: $id) {
    id
    owner
    name
    type
    venue
    theater
    seat
    city
    eventDate
    eventTime
    timeCreated
    ticketsID
    visibility
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTicketQueryVariables, APITypes.GetTicketQuery>;
export const listTickets = /* GraphQL */ `query ListTickets(
  $filter: ModelTicketFilterInput
  $limit: Int
  $nextToken: String
) {
  listTickets(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      owner
      name
      type
      venue
      theater
      seat
      city
      eventDate
      eventTime
      timeCreated
      ticketsID
      visibility
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTicketsQueryVariables,
  APITypes.ListTicketsQuery
>;
export const ticketsByOwner = /* GraphQL */ `query TicketsByOwner(
  $owner: String!
  $sortDirection: ModelSortDirection
  $filter: ModelTicketFilterInput
  $limit: Int
  $nextToken: String
) {
  ticketsByOwner(
    owner: $owner
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      owner
      name
      type
      venue
      theater
      seat
      city
      eventDate
      eventTime
      timeCreated
      ticketsID
      visibility
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TicketsByOwnerQueryVariables,
  APITypes.TicketsByOwnerQuery
>;
export const ticketsByTicketsID = /* GraphQL */ `query TicketsByTicketsID(
  $ticketsID: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelTicketFilterInput
  $limit: Int
  $nextToken: String
) {
  ticketsByTicketsID(
    ticketsID: $ticketsID
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      owner
      name
      type
      venue
      theater
      seat
      city
      eventDate
      eventTime
      timeCreated
      ticketsID
      visibility
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.TicketsByTicketsIDQueryVariables,
  APITypes.TicketsByTicketsIDQuery
>;
