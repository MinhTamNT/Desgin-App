import { gql } from "@apollo/client";

const ADD_USER = gql`
  mutation AddUser(
    $name: String!
    $roleId: Int!
    $profilePicture: String
    $uuid: String
  ) {
    addUser(
      name: $name
      roleId: $roleId
      profilePicture: $profilePicture
      uuid: $uuid
    ) {
      idUser
    }
  }
`;

export { ADD_USER };
