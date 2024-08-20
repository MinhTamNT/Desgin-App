import { gql } from "@apollo/client";

const INVITE_USER = gql`
  mutation Mutation(
    $emailContent: String!
    $projectId: String!
    $userInvited: String!
  ) {
    InvitedUser(
      email_content: $emailContent
      projectId: $projectId
      userInvited: $userInvited
    ) {
      updatedAt
      idInvitation
      email_content
    }
  }
`;

const UPDATE_INVITE = gql`
  mutation Mutation($invitationIdInvitation: String!, $status: Status) {
    updateInivitation(
      invitation_idInvitation: $invitationIdInvitation
      status: $status
    ) {
      Project_idProject
      createdAt
      idInvitation
      email_content
    }
  }
`;
export { INVITE_USER, UPDATE_INVITE };
