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

export { ADD_USER };
