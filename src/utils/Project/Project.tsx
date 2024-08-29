import { gql } from "@apollo/client";

const ADD_PROJECT = gql`
  mutation Mutation($name: String!, $description: String!) {
    addProject(name: $name, description: $description) {
      updatedAt
      idProject
    }
  }
`;

const GET_PROJECT = gql`
  query Query {
    getUserProjects {
      is_host_user
      name
      idProject
      description
      access
    }
  }
`;

const DELETED_PROJECT = gql`
  mutation Mutation($projectId: String) {
    deletedProjectId(projectId: $projectId) {
      message
    }
  }
`;

export { ADD_PROJECT, GET_PROJECT, DELETED_PROJECT };
