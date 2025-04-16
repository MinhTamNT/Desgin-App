import { gql } from "@apollo/client";
export const ADD_PAGE_TO_PROJECT = gql`
  mutation AddPageToProject(
    $projectId: String!
    $name: String!
    $content: String
  ) {
    addPageToProject(projectId: $projectId, name: $name, content: $content) {
      id
      name
      content
      createdAt
      updatedAt
    }
  }
`;

export const GET_ROOMS_BY_PROJECT = gql`
  query GetRoomsByProject($projectId: String!) {
    getRoomsByProject(projectId: $projectId) {
      id
      pageId
      pageName
      createdAt
    }
  }
`;
