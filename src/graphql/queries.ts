/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getTicket = /* GraphQL */ `query GetTicket($id: ID!) {
  getTicket(id: $id) {
    id
    name
    type
    seat
    venue
    city
    date
    time
    ticketsID
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
      name
      type
      seat
      venue
      city
      date
      time
      ticketsID
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
      name
      type
      seat
      venue
      city
      date
      time
      ticketsID
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
export const getTicketCollection = /* GraphQL */ `query GetTicketCollection($id: ID!) {
  getTicketCollection(id: $id) {
    id
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
export const getUser = /* GraphQL */ `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    Tickets {
      id
      createdAt
      updatedAt
      __typename
    }
    createdAt
    updatedAt
    userTicketsId
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
      username
      createdAt
      updatedAt
      userTicketsId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
