import { gql } from "@apollo/client";

export const GET_NOTIFICATION = gql`
  query GetNotificationsByUserId($pageIndex: Int, $pageSize: Int) {
    getNotificationsByUserId(pageIndex: $pageIndex, pageSize: $pageSize) {
      notifications {
        idNotification
        type
        message
        is_read
        createdAt
        invitation_idInvitation
      }
      pageInfo {
        TOTALROW
      }
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
