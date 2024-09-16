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
interface Props {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  role: any;
}

export const Live = ({ canvasRef, role }: Props) => {
  const others = useOthers();
  const [{ cursor }, updatePersence] = useMyPresence() as any;
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (role === "ROLE_READ") return; // Disable in read-only mode
      event.preventDefault();
      if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updatePersence({
          cursor: { x, y },
        });
      }
    },
    [cursor, cursorState.mode, updatePersence, role]
  );

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent) => {
      if (role === "ROLE_READ") return; // Disable in read-only mode
      event.preventDefault();
      updatePersence({
        cursor: null,
        message: null,
      });
      setCursorState({ mode: CursorMode.Hidden });
    },
    [updatePersence, role]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (role === "ROLE_READ") return; // Disable in read-only mode
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
      if (role === "ROLE_READ") return; // Disable in read-only mode
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
      if (role === "ROLE_READ") return; // Disable in read-only mode
      setCursorState({
        mode: CursorMode.Reaction,
        reaction,
        isPressed: false,
      });
    },
    [role]
  );

  useEffect(() => {
    if (role === "ROLE_READ") return; // Skip adding keyboard events in read-only mode
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

  return (
    <div
      id="canvas"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative flex h-full w-full items-center justify-center"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
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
        role !== "ROLE_READ" && <ReactionSelector setReaction={setReaction} />}
      <LiveCursor others={others} />
    </div>
  );
};
