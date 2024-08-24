import { gql } from "@apollo/client";

const CREATE_MESSAGE = gql`
  mutation CreateMessage($message: String!, $conversationId: ID) {
    createMessage(message: $message, conversationId: $conversationId) {
      text
      conversationId
      sender {
        name
        profilePicture
        uuid
      }
    }
  }
`;

const GET_MESSAGE_CONVERSATIONID = gql`
  query GetMessageConversationId($conversationId: String) {
    getMessageConversationId(conversationId: $conversationId) {
      text
      sender {
        name
        profilePicture
        uuid
      }
    }
  }
`;

const GET_MESSAGE_SUB = gql`
  subscription Subscription {
    messageCreated {
      sender {
        name
        profilePicture
        uuid
      }
      text
      conversationId
    }
  }
`;

export { CREATE_MESSAGE, GET_MESSAGE_CONVERSATIONID, GET_MESSAGE_SUB };
