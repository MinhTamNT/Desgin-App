import { gql } from "@apollo/client";

const GET_ACTIVATE = gql`
  query Query {
    getUserActivityLog {
      action
      createdAt
      details
      idactivityLogSchema
    }
  }
`;
export { GET_ACTIVATE };
