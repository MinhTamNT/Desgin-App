import { gql } from "@apollo/client";

// Mutation để thêm comment
export const ADD_COMMENT = gql`
  mutation Mutation(
    $content: String!
    $x: Float!
    $y: Float!
    $userId: String!
  ) {
    addComment(content: $content, x: $x, y: $y, userId: $userId) {
      RetCode
      RetMessgae
    }
  }
`;

// Mutation để thêm reaction
export const ADD_REACTION = gql`
  mutation AddReaction(
    $userId: String!
    $commentId: String!
    $reactionType: String!
  ) {
    addReaction(
      userId: $userId
      commentId: $commentId
      reactionType: $reactionType
    ) {
      RetCode
      RetMessgae
    }
  }
`;

// Mutation để thêm reply
export const ADD_REPLY = gql`
  mutation AddReply(
    $content: String!
    $userId: String!
    $parentCommentId: String!
  ) {
    addReply(
      content: $content
      userId: $userId
      parentCommentId: $parentCommentId
    ) {
      RetCode
      RetMessgae
    }
  }
`;

export const LOAD_COMMENTS = gql`
  query Query($projectId: String!) {
    loadComments(projectId: $projectId) {
      content
      createdAt
      id
      reactionCount
      replyCount
      updatedAt
      userId
      x
      y
    }
  }
`;
export const UPDATE_COMMENT_POSITION = gql`
  mutation UpdateCommentPosition($commentId: String!, $x: Float!, $y: Float!) {
    updateCommentPosition(commentId: $commentId, x: $x, y: $y) {
      content
      createdAt
      id
      reactionCount
      replyCount
      updatedAt
      userId
      x
      y
    }
  }
`;

export const COMMENT_POSITION_UPDATED = gql`
  subscription CommentPositionUpdated($projectId: String!) {
    commentPositionUpdated(projectId: $projectId) {
      id
      x
      y
    }
  }
`;
