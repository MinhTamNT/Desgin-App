import { gql } from "@apollo/client";

const INVITE_USER = gql`
  mutation Mutation($emailContent: String!, $projectId: String!, $userInvited: String!) {
  InvitedUser(email_content: $emailContent, projectId: $projectId, userInvited: $userInvited) {
    RetCode
    RetMessgae
  }
}
`;

const UPDATE_INVITE = gql`
mutation UpdateInivitation($invitationIdInvitation: String!, $status: Status) {
  updateInivitation(invitation_idInvitation: $invitationIdInvitation, status: $status) {
    RetCode
    RetMessgae
  }
}
`;
export { INVITE_USER, UPDATE_INVITE };
