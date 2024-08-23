import { gql } from "@apollo/client";

const CREATE_CONVERSATION = gql`
  mutation Mutation($receiverId: String!) {
    createConversation(receiverId: $receiverId) {
      createdAt
    }
  }
`;

const GET_CONERSATION = gql`
  query Query {
    getConversation {
      createdAt
      id
      messageCount
      members {
        uuid
        name
        profilePicture
      }
    }
  }
`;

export { CREATE_CONVERSATION, GET_CONERSATION };
