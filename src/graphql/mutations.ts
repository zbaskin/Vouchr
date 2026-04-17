/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createUser = /* GraphQL */ `mutation CreateUser(
  $input: CreateUserInput!
  $condition: ModelUserConditionInput
) {
  createUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserMutationVariables,
  APITypes.CreateUserMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser(
  $input: DeleteUserInput!
  $condition: ModelUserConditionInput
) {
  deleteUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const createTicketCollection = /* GraphQL */ `mutation CreateTicketCollection(
  $input: CreateTicketCollectionInput!
  $condition: ModelTicketCollectionConditionInput
) {
  createTicketCollection(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateTicketCollectionMutationVariables,
  APITypes.CreateTicketCollectionMutation
>;
export const updateTicketCollection = /* GraphQL */ `mutation UpdateTicketCollection(
  $input: UpdateTicketCollectionInput!
  $condition: ModelTicketCollectionConditionInput
) {
  updateTicketCollection(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateTicketCollectionMutationVariables,
  APITypes.UpdateTicketCollectionMutation
>;
export const deleteTicketCollection = /* GraphQL */ `mutation DeleteTicketCollection(
  $input: DeleteTicketCollectionInput!
  $condition: ModelTicketCollectionConditionInput
) {
  deleteTicketCollection(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTicketCollectionMutationVariables,
  APITypes.DeleteTicketCollectionMutation
>;
export const createTicket = /* GraphQL */ `mutation CreateTicket(
  $input: CreateTicketInput!
  $condition: ModelTicketConditionInput
) {
  createTicket(input: $input, condition: $condition) {
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
    rating
    notes
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTicketMutationVariables,
  APITypes.CreateTicketMutation
>;
export const updateTicket = /* GraphQL */ `mutation UpdateTicket(
  $input: UpdateTicketInput!
  $condition: ModelTicketConditionInput
) {
  updateTicket(input: $input, condition: $condition) {
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
    rating
    notes
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTicketMutationVariables,
  APITypes.UpdateTicketMutation
>;
export const deleteTicket = /* GraphQL */ `mutation DeleteTicket(
  $input: DeleteTicketInput!
  $condition: ModelTicketConditionInput
) {
  deleteTicket(input: $input, condition: $condition) {
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
    rating
    notes
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTicketMutationVariables,
  APITypes.DeleteTicketMutation
>;
