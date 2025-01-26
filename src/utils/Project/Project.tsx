import { gql } from "@apollo/client";

const ADD_PROJECT = gql`
  mutation Mutation($name: String!, $description: String!) {
    addProject(name: $name, description: $description) {
      RetCode
      RetMessgae
    }
  }
`;

const GET_PROJECT = gql`
  query Query($pageIndex: Int, $pageSize: Int) {
    getUserProjects(pageIndex: $pageIndex, pageSize: $pageSize) {
      projects {
        access
        createdAt
        description
        idProject
        is_host_user
        name
        updatedAt
      }
      pageInfo {
        IND
        TOTALROW
      }
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

const UPDATE_ROLE = gql`
  mutation Mutation($userId: String!, $role: String!, $projectId: String!) {
    updateRoleProject(userId: $userId, role: $role, projectId: $projectId) {
      access
      is_host_user
      lastAccessed
      projectName
    }
  }
`;

const REMOVED_MEMBER_PROJECT = gql`
  mutation Mutation($projectId: String!, $userId: String!) {
    removeUserFromProject(projectId: $projectId, userId: $userId) {
      access
      accessCount
      is_host_user
      lastAccessed
      projectName
      project_idProject
      user_idUser
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
  UPDATE_ROLE,
  REMOVED_MEMBER_PROJECT,
};
