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

const UPDATE_LASTETS_ACCESS = gql`
  mutation Mutation($projectId: String!) {
    updateProjectAcces(projectId: $projectId) {
      accessCount
      lastAccessed
      project_idProject
    }
  }
`;

const GET_RECENET_PROJECT = gql`
  query GetRecentProjectsWithAccess {
    getRecentProjectsWithAccess {
      accessCount
      is_host_user
      project_idProject
      lastAccessed
      projectName
    }
  }
`;

const GET_MEMEBER_IN_PROJECT = gql`
  query GetMememberInProject($projectId: String) {
    getMememberInProject(projectId: $projectId) {
      User {
        name
        profilePicture
        idUser
      }
      access
      is_host_user
      project_idProject
    }
  }
`;

export {
  ADD_PROJECT,
  GET_PROJECT,
  DELETED_PROJECT,
  UPDATE_LASTETS_ACCESS,
  GET_RECENET_PROJECT,
  GET_MEMEBER_IN_PROJECT,
};
