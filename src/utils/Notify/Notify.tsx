import { gql } from "@apollo/client";

export const GET_NOTIFICATION = gql`
  query Query {
    getNotificationsByUserId {
      message
      type
      invitation_idInvitation
      userRequest {
        idUser
        name
        email
      }
      is_read
      idNotification
      createdAt
    }
  }
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription Subscription {
    notificationCreated {
      message
      type
      is_read
      invitation_idInvitation
      idNotification
      createdAt
      userRequest {
        profilePicture
        name
        idUser
      }
    }
  }
`;
