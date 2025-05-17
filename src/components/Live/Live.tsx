import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@liveblocks/react/suspense";
import React, { useCallback, useEffect, useState, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  const [reactions, setReactions] = useState<Reaction[]>([]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
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

  const handleContextMenuClick = useCallback(
    (key: string) => {
      if (
        role === "ROLE_READ" &&
        (key === "Undo" ||
          key === "Redo" ||
          key === "Chat" ||
          key === "Reactions")
      ) {
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
    },
    [role, undo, redo]
  );

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

  // Thêm biến để theo dõi trạng thái hoạt động
  const [isActive, setIsActive] = useState(false);

  // Cập nhật khi có tương tác với canvas
  useEffect(() => {
    const handleActivity = () => {
      setIsActive(true);
      // Tự động reset sau một khoảng thời gian
      setTimeout(() => setIsActive(false), 200);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("touchmove", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("touchmove", handleActivity);
    };
  }, []);

  useInterval(() => {
    if (isActive && cursor) {
      updatePersence({
        cursor: { x: cursor.x, y: cursor.y },
      });
    }
  }, 50);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const resizeCanvas = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        canvasRef.current!.width = rect.width;
        canvasRef.current!.height = rect.height;
      };
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }
  }, [canvasRef]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative flex h-screen w-screen items-center justify-center overflow-hidden"
      >
        {role === "ROLE_READ" && (
          <div className="absolute top-4 right-4 z-50 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Chế độ chỉ xem
          </div>
        )}
        <div ref={containerRef} className="w-full h-full relative">
          <div
            className="relative w-full h-full min-h-screen"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px),
                radial-gradient(circle at 50% 50%, rgba(0,0,0,0.03) 0%, transparent 60%)
              `,
              backgroundSize: "20px 20px, 20px 20px, 100% 100%",
              backgroundColor: "#f7f7f9",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.07)",
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
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
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content bg-white border border-gray-200 shadow-lg rounded-lg p-2 w-64">
        {shortcuts.map((shortcut) => {
          const isDisabled =
            role === "ROLE_READ" &&
            (shortcut.name === "Undo" ||
              shortcut.name === "Redo" ||
              shortcut.name === "Chat" ||
              shortcut.name === "Reactions");

          return (
            <ContextMenuItem
              key={shortcut.key}
              className={`right-menu-item flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
                isDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() =>
                !isDisabled && handleContextMenuClick(shortcut.name)
              }
              disabled={isDisabled}
            >
              <span
                className={`right-menu-name font-medium ${
                  isDisabled ? "text-gray-400" : "text-gray-800"
                }`}
              >
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
