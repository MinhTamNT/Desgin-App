import { gql } from "@apollo/client";

const ADD_USER = gql`
  mutation Mutation(
    $idUser: String!
    $name: String!
    $roleId: Int!
    $profilePicture: String
  ) {
    addUser(
      idUser: $idUser
      name: $name
      roleId: $roleId
      profilePicture: $profilePicture
    ) {
      createdAt
      updatedAt
    }
  }
`;

const SEARCH_USER = gql`
  query SearchUserByName($searchText: String!) {
    searchUserByName(searchText: $searchText) {
      updatedAt
      profilePicture
      name
      createdAt
    }
  }
`;

export { ADD_USER, SEARCH_USER };
