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
export { INVITE_USER };
