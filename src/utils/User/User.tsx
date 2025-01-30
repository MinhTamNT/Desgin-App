import { gql } from "@apollo/client";

const ADD_USER = gql`
  mutation Mutation(
    $idUser: String!
    $name: String!
    $email: String!
    $tokenUser: String!
    $expireAt: String!
    $profilePicture: String
  ) {
    addUser(
      idUser: $idUser
      name: $name
      email: $email
      TokenUser: $tokenUser
      expireAt: $expireAt
      profilePicture: $profilePicture
    ) {
      ... on User {
        idUser
        uuid
        name
        email
        profilePicture
        status
        deviceId
        createdAt
        updatedAt
        roleId
      }
      ... on ProccessObj {
        RetCode
        RetMessgae
      }
    }
  }
`;

const SEARCH_USER = gql`
  query SearchUserByName($searchText: String!) {
    searchUserByName(searchText: $searchText) {
      ... on User {
        idUser
        name
        profilePicture,
        status
      }
      ... on ProccessObj {
        RetCode
        RetMessgae
      }
    }
  }
`;

export { ADD_USER, SEARCH_USER };
