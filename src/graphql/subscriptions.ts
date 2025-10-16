/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateUser = /* GraphQL */ `subscription OnCreateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onCreateUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionVariables,
  APITypes.OnCreateUserSubscription
>;
export const onUpdateUser = /* GraphQL */ `subscription OnUpdateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onUpdateUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionVariables,
  APITypes.OnUpdateUserSubscription
>;
export const onDeleteUser = /* GraphQL */ `subscription OnDeleteUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onDeleteUser(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
>;
export const onCreateTicketCollection = /* GraphQL */ `subscription OnCreateTicketCollection(
  $filter: ModelSubscriptionTicketCollectionFilterInput
  $owner: String
) {
  onCreateTicketCollection(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTicketCollectionSubscriptionVariables,
  APITypes.OnCreateTicketCollectionSubscription
>;
export const onUpdateTicketCollection = /* GraphQL */ `subscription OnUpdateTicketCollection(
  $filter: ModelSubscriptionTicketCollectionFilterInput
  $owner: String
) {
  onUpdateTicketCollection(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTicketCollectionSubscriptionVariables,
  APITypes.OnUpdateTicketCollectionSubscription
>;
export const onDeleteTicketCollection = /* GraphQL */ `subscription OnDeleteTicketCollection(
  $filter: ModelSubscriptionTicketCollectionFilterInput
  $owner: String
) {
  onDeleteTicketCollection(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTicketCollectionSubscriptionVariables,
  APITypes.OnDeleteTicketCollectionSubscription
>;
export const onCreateTicket = /* GraphQL */ `subscription OnCreateTicket(
  $filter: ModelSubscriptionTicketFilterInput
  $owner: String
) {
  onCreateTicket(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTicketSubscriptionVariables,
  APITypes.OnCreateTicketSubscription
>;
export const onUpdateTicket = /* GraphQL */ `subscription OnUpdateTicket(
  $filter: ModelSubscriptionTicketFilterInput
  $owner: String
) {
  onUpdateTicket(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTicketSubscriptionVariables,
  APITypes.OnUpdateTicketSubscription
>;
export const onDeleteTicket = /* GraphQL */ `subscription OnDeleteTicket(
  $filter: ModelSubscriptionTicketFilterInput
  $owner: String
) {
  onDeleteTicket(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTicketSubscriptionVariables,
  APITypes.OnDeleteTicketSubscription
>;
