import { gql } from "@apollo/client";

const ADD_USER = gql`
  mutation AddUser(
    $idUser: String!
    $name: String!
    $roleId: Int!
    $email: String!
    $profilePicture: String
  ) {
    addUser(
      idUser: $idUser
      name: $name
      roleId: $roleId
      email: $email
      profilePicture: $profilePicture
    ) {
      createdAt
      email
      idUser
      name
      profilePicture
      roleId
      updatedAt
    }
  }
`;

const SEARCH_USER = gql`
  query SearchUserByName($searchText: String!) {
    searchUserByName(searchText: $searchText) {
      idUser
      updatedAt
      profilePicture
      name
      createdAt
    }
  }
`;

export { ADD_USER, SEARCH_USER };
