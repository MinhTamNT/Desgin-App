import { gql } from "@apollo/client";

const ADD_PROJECT = gql`
  mutation Mutation(
    $name: String!
    $description: String!
    $listInvite: String
  ) {
    addProject(
      name: $name
      description: $description
      listInvite: $listInvite
    ) {
      RetCode
      RetMessgae
    }
  }
`;

const GET_PROJECT = gql`
  query Query($pageIndex: Int, $pageSize: Int, $nameProject: String) {
    getUserProjects(
      pageIndex: $pageIndex
      pageSize: $pageSize
      nameProject: $nameProject
    ) {
      pageInfo {
        IND
        TOTALROW
      }
      projects {
        access
        createdAt
        description
        idProject
        is_host_user
        name
        updatedAt,
        PublicProjectCount,
        PrivateProjectCount,
        JoinedProjectsNotOwner,
        OwnedProjects
      }
    }
  }
`;

const DELETED_PROJECT = gql`
  mutation DeletedProjectId($projectId: String) {
    deletedProjectId(projectId: $projectId) {
      RetCode
      RetMessgae
    }
  }
`;

const UPDATE_LASTETS_ACCESS = gql`
  mutation Mutation($projectId: String!) {
    updateProjectAcces(projectId: $projectId) {
      RetCode
      RetMessgae
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
  mutation Mutation($projectId: String!, $userId: String!, $role: String!) {
    updateRoleProject(projectId: $projectId, userId: $userId, role: $role) {
      RetCode
      RetMessgae
    }
  }
`;

const REMOVED_MEMBER_PROJECT = gql`
  mutation RemoveUserFromProject($projectId: String!, $userId: String!) {
    removeUserFromProject(projectId: $projectId, userId: $userId) {
      RetCode
      RetMessgae
    }
  }
`;
const USER_STATUS_CHANGED = gql`
  subscription OnUserStatusChanged {
    userStatusChanged {
      userId
      isOnline
      lastSeen
    }
  }
`;
const CHECK_PROJECT = gql`
  query CheckProject($projectId: String!) {
    checkProject(projectId: $projectId) {
      RetCode
      RetMessgae
    }
  }
`;

const REQUEST_PROJECT_ACCESS = gql`
  mutation SendProjectAccessRequestEmail(
    $projectId: String!
    $message: String!
    $nameRequest: String!
    $imageRequest: String!
    $emailRequest: String!
  ) {
    sendProjectAccessRequestEmail(
      projectId: $projectId
      message: $message
      nameRequest: $nameRequest
      imageRequest: $imageRequest
      emailRequest: $emailRequest
    ) {
      RetCode
      RetMessgae
    }
  }
`;

const UPDATE_PROJECT_VISIBILITY = gql`
  mutation UpdateProjectVisibility($projectId: String!, $visibility: String!) {
    UpdateProjectVisibility(projectId: $projectId, visibility: $visibility) {
      RetCode
      RetMessgae
    }
  }
`;

export {
  ADD_PROJECT,
  GET_PROJECT,
  DELETED_PROJECT,
  UPDATE_LASTETS_ACCESS,
  GET_MEMEBER_IN_PROJECT,
  UPDATE_ROLE,
  REMOVED_MEMBER_PROJECT,
  USER_STATUS_CHANGED,
  CHECK_PROJECT,
  REQUEST_PROJECT_ACCESS,
  UPDATE_PROJECT_VISIBILITY,
};
