/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateTicket = /* GraphQL */ `subscription OnCreateTicket($filter: ModelSubscriptionTicketFilterInput) {
  onCreateTicket(filter: $filter) {
    id
    name
    type
    seat
    venue
    city
    eventDate
    eventTime
    timeCreated
    ticketsID
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateTicketSubscriptionVariables,
  APITypes.OnCreateTicketSubscription
>;
export const onUpdateTicket = /* GraphQL */ `subscription OnUpdateTicket($filter: ModelSubscriptionTicketFilterInput) {
  onUpdateTicket(filter: $filter) {
    id
    name
    type
    seat
    venue
    city
    eventDate
    eventTime
    timeCreated
    ticketsID
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateTicketSubscriptionVariables,
  APITypes.OnUpdateTicketSubscription
>;
export const onDeleteTicket = /* GraphQL */ `subscription OnDeleteTicket($filter: ModelSubscriptionTicketFilterInput) {
  onDeleteTicket(filter: $filter) {
    id
    name
    type
    seat
    venue
    city
    eventDate
    eventTime
    timeCreated
    ticketsID
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteTicketSubscriptionVariables,
  APITypes.OnDeleteTicketSubscription
>;
export const onCreateTicketCollection = /* GraphQL */ `subscription OnCreateTicketCollection(
  $filter: ModelSubscriptionTicketCollectionFilterInput
) {
  onCreateTicketCollection(filter: $filter) {
    id
    sort
    Tickets {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateTicketCollectionSubscriptionVariables,
  APITypes.OnCreateTicketCollectionSubscription
>;
export const onUpdateTicketCollection = /* GraphQL */ `subscription OnUpdateTicketCollection(
  $filter: ModelSubscriptionTicketCollectionFilterInput
) {
  onUpdateTicketCollection(filter: $filter) {
    id
    sort
    Tickets {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateTicketCollectionSubscriptionVariables,
  APITypes.OnUpdateTicketCollectionSubscription
>;
export const onDeleteTicketCollection = /* GraphQL */ `subscription OnDeleteTicketCollection(
  $filter: ModelSubscriptionTicketCollectionFilterInput
) {
  onDeleteTicketCollection(filter: $filter) {
    id
    sort
    Tickets {
      nextToken
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteTicketCollectionSubscriptionVariables,
  APITypes.OnDeleteTicketCollectionSubscription
>;
export const onCreateUser = /* GraphQL */ `subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
  onCreateUser(filter: $filter) {
    id
    username
    Tickets {
      id
      sort
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
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionVariables,
  APITypes.OnCreateUserSubscription
>;
export const onUpdateUser = /* GraphQL */ `subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
  onUpdateUser(filter: $filter) {
    id
    username
    Tickets {
      id
      sort
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionVariables,
  APITypes.OnUpdateUserSubscription
>;
export const onDeleteUser = /* GraphQL */ `subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
  onDeleteUser(filter: $filter) {
    id
    username
    Tickets {
      id
      sort
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
>;
