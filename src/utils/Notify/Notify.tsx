import { gql } from "@apollo/client";

export const GET_NOTIFICATION = gql`
  query GetNotificationsByUserId {
    getNotificationsByUserId {
      message
      is_read
      idNotification
    }
  }
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription NotificationCreated {
    notificationCreated {
      message
      createdAt
      idNotification
      is_read
    }
  }
`;
