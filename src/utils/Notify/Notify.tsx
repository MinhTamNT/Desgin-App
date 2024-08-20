import { gql } from "@apollo/client";

export const GET_NOTIFICATION = gql`
  query GetNotificationsByUserId {
    getNotificationsByUserId {
      message
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
      is_read
      idNotification
      createdAt
    }
  }
`;
