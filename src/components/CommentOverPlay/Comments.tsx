import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useSubscription } from "@apollo/client";
import {
  COMMENT_POSITION_UPDATED,
  LOAD_COMMENTS,
  UPDATE_COMMENT_POSITION,
} from "../../utils/Comment/Comment";

type Comment = {
  id: string;
  content: string;
  x: number;
  y: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  reactionCount: number;
  replyCount: number;
};

type CommentsProps = {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  projectId: string;
};

export const Comments = ({ canvasRef, projectId }: CommentsProps) => {
  const { data, loading, error } = useQuery(LOAD_COMMENTS, {
    variables: { projectId },
  });

  const [updateCommentPosition] = useMutation(UPDATE_COMMENT_POSITION); // Mutation để cập nhật vị trí comment

  const [comments, setComments] = useState<Comment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCommentId, setDraggedCommentId] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const { data: subscriptionData } = useSubscription(COMMENT_POSITION_UPDATED, {
    variables: { commentId: draggedCommentId },
  });
  // Load comments từ server khi query hoàn thành
  useEffect(() => {
    if (data && data.loadComments) {
      setComments(data.loadComments);
    }
  }, [data]);

  useEffect(() => {
    if (subscriptionData && subscriptionData.commentPositionUpdated) {
      const updatedComment = subscriptionData.commentPositionUpdated;
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === updatedComment.id
            ? { ...comment, x: updatedComment.x, y: updatedComment.y }
            : comment
        )
      );
    }
  }, [subscriptionData]);

  const handleMouseDown = (e: React.MouseEvent, commentId: string) => {
    setIsDragging(true);
    console.log(commentId);
    setDraggedCommentId(commentId);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !draggedCommentId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const deltaX = e.clientX - (position?.x || 0);
    const deltaY = e.clientY - (position?.y || 0);

    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === draggedCommentId) {
          const newX = Math.max(
            0,
            Math.min(comment.x + deltaX, canvasRect.width)
          );
          const newY = Math.max(
            0,
            Math.min(comment.y + deltaY, canvasRect.height)
          );
          return { ...comment, x: newX, y: newY };
        }
        return comment;
      })
    );

    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (isDragging && draggedCommentId) {
      const updatedComment = comments.find(
        (comment) => comment.id === draggedCommentId
      );

      if (updatedComment) {
        updateCommentPosition({
          variables: {
            commentId: updatedComment.id,
            x: updatedComment.x,
            y: updatedComment.y,
          },
        });
      }
    }

    setIsDragging(false);
    setDraggedCommentId(null);
    setPosition(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, draggedCommentId, position]);

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error loading comments: {error.message}</div>;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="absolute bg-blue-500 text-white rounded-full p-2 cursor-pointer pointer-events-auto"
          style={{
            left: `${comment.x}px`,
            top: `${comment.y}px`,
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={(e) => handleMouseDown(e, comment.id)}
        >
          {comment.content}
        </div>
      ))}
    </div>
  );
};
