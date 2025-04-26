import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@liveblocks/react/suspense";
import React, { useCallback, useEffect, useState } from "react";
import { useInterval } from "../../hook/useInterval";
import {
  CursorMode,
  CursorState,
  Reaction,
  ReactionEvent,
} from "../../type/type";
import { CursorChat } from "../Cursor/CursorChat";
import { LiveCursor } from "../Cursor/LiveCursor";
import FlyingReaction from "../Reaction/FlyingReact";
import ReactionSelector from "../Reaction/ReactionButton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@radix-ui/react-context-menu";
import { shortcuts } from "../../utils";
import { Comments } from "../CommentOverPlay/Comments";
import { useMutation } from "@apollo/client";
import { ADD_COMMENT } from "../../utils/Comment/Comment";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import "reactflow/dist/style.css";
interface Props {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  role: any;
  undo: () => void;
  redo: () => void;
}

export const Live = ({ canvasRef, role, undo, redo }: Props) => {
  const others = useOthers();
  const [{ cursor }, updatePersence] = useMyPresence() as any;
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [newComment, setNewComment] = useState("");
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [addComment] = useMutation(ADD_COMMENT);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [pageName, setPageName] = useState("");
  const [pageContent, setPageContent] = useState("");
  const currentUser = useSelector(
    (state: RootState) => state.user.user.currentUser
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (role === "ROLE_READ") return;
      
      if (e.key === "c" || e.key === "C") {
        setIsCommenting(true);
        setCommentPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }); // Hiển thị ở giữa màn hình
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [role]);

  const handleKeyDownInInput = async (e: React.KeyboardEvent) => {
    if (role === "ROLE_READ") return;
    
    if (e.key === "Enter" && newComment.trim() !== "") {
      console.log("New comment:", newComment, "at position:", commentPosition);
      const x = commentPosition?.x;
      const y = commentPosition?.y;
      await addComment({
        variables: {
          content: newComment,
          x: x,
          y: y,
          userId: currentUser?.sub,
        },
      });

      setIsCommenting(false);
      setNewComment("");
      setCommentPosition(null);
    }
  };

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      // Cho phép cập nhật vị trí con trỏ ngay cả với ROLE_READ để người dùng khác có thể thấy
      if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updatePersence({
          cursor: { x, y },
        });
      }
    },
    [cursor, cursorState.mode, updatePersence]
  );

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      // Vẫn cho phép cập nhật vị trí con trỏ khi rời đi cho cả ROLE_READ
      updatePersence({
        cursor: null,
        message: null,
      });
      setCursorState({ mode: CursorMode.Hidden });
    },
    [updatePersence]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (role === "ROLE_READ") return;
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
      updatePersence({
        cursor: { x, y },
      });
      setCursorState((state) =>
        state.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [updatePersence, role]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (role === "ROLE_READ") return;
      setCursorState((state) =>
        state.mode === CursorMode.Reaction
          ? { ...state, isPressed: false }
          : state
      );
    },
    [role]
  );

  const setReaction = useCallback(
    (reaction: string) => {
      if (role === "ROLE_READ") return;
      setCursorState({
        mode: CursorMode.Reaction,
        reaction,
        isPressed: false,
      });
    },
    [role]
  );

  useEffect(() => {
    if (role === "ROLE_READ") return;
    const keyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updatePersence({ message: "" });
        setCursorState({
          mode: CursorMode.Hidden,
        });
      } else if (e.key === "e") {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };
    window.addEventListener("keyup", keyUp);
    window.addEventListener("keydown", keyDown);
    return () => {
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("keydown", keyDown);
    };
  }, [updatePersence, role]);

  const broadcast = useBroadcastEvent();
  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions((prevReactions) => [
        ...prevReactions,
        {
          point: { x: cursor.x, y: cursor.y },
          value: cursorState.reaction,
          timestamp: Date.now(),
        },
      ]);
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 5);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((prevReactions) => [
      ...prevReactions,
      {
        point: { x: event.x, y: event.y },
        value: event.value,
        timestamp: Date.now(),
      },
    ]);
  });

  const handleContextMenuClick = useCallback((key: string) => {
    if (role === "ROLE_READ" && (key === "Undo" || key === "Redo" || key === "Chat" || key === "Reactions")) {
      return; 
    }
    
    console.log(key);
    switch (key) {
      case "Chat":
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
        break;
      case "Undo":
        undo();
        break;
      case "Redo":
        redo();
        break;
      case "Reactions":
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
        break;
      default:
        break;
    }
  }, [role, undo, redo]);

  const handleEmojiClick = (emojiObject: any) => {
    setNewComment((prev) => prev + emojiObject.emoji); 
  };

  useEffect(() => {
    if (role === "ROLE_READ") {
      const canvasElement = canvasRef.current;
      if (canvasElement) {
        // Chỉ thay đổi con trỏ, không làm ảnh hưởng đến việc hiển thị nội dung
        canvasElement.style.cursor = "not-allowed";
      }
    } else {
      const canvasElement = canvasRef.current;
      if (canvasElement) {
        canvasElement.style.cursor = "auto";
      }
    }
  }, [role, canvasRef]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative flex h-full w-full items-center"
      >
        {role === "ROLE_READ" && (
          <div className="absolute top-4 right-4 z-50 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Chế độ chỉ xem
          </div>
        )}
        <div
          className="relative w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(224, 224, 224, 0.8) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(224, 224, 224, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: "5px 5px",
            backgroundColor: "#f9f9f9",
            boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        {reactions.map((reaction) => (
          <FlyingReaction
            key={reaction.timestamp.toString()}
            x={reaction.point.x}
            y={reaction.point.y}
            timestamp={reaction.timestamp}
            value={reaction.value}
          />
        ))}
        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updatePersence}
          />
        )}
        {cursorState.mode === CursorMode.ReactionSelector &&
          role !== "ROLE_READ" && (
            <ReactionSelector setReaction={setReaction} />
          )}
        <LiveCursor others={others} />
        <Comments />
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-64">
        {shortcuts.map((shortcut) => {
          const isDisabled = role === "ROLE_READ" && 
            (shortcut.name === "Undo" || shortcut.name === "Redo" || 
             shortcut.name === "Chat" || shortcut.name === "Reactions");
          
          return (
            <ContextMenuItem
              key={shortcut.key}
              className={`right-menu-item flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !isDisabled && handleContextMenuClick(shortcut.name)}
              disabled={isDisabled}
            >
              <span className={`right-menu-name font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
                {shortcut.name}
              </span>
              <span className="right-menu-shortcut text-xs text-gray-500">
                {shortcut.shortcut}
              </span>
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
};
