import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@liveblocks/react/suspense";
import { LiveCursor } from "../Cursor/LiveCursor";
import React, { useCallback, useEffect, useState } from "react";
import { CursorChat } from "../Cursor/CursorChat";
import {
  CursorMode,
  CursorState,
  Reaction,
  ReactionEvent,
} from "../../type/type";
import ReactionSelector from "../Reaction/ReactionButton";
import FlyingReaction from "../Reaction/FlyingReact";
import { useInterval } from "../../hook/useInterval";

export const Live = () => {
  const others = useOthers();
  const [{ cursor }, updatePersence] = useMyPresence() as any;
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const handlePointterMove = useCallback(
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

  const handlePointterLeave = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      updatePersence({
        cursor: null,
        message: null,
      });
      setCursorState({ mode: CursorMode.Hidden });
    },
    [updatePersence]
  );

  const handlePointterDown = useCallback(
    (event: React.PointerEvent) => {
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
    [updatePersence]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent) => {
    setCursorState((state) =>
      state.mode === CursorMode.Reaction
        ? { ...state, isPressed: false }
        : state
    );
  }, []);

  const setReaction = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  useEffect(() => {
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
  }, [updatePersence]);

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
      onPointerMove={handlePointterMove}
      onPointerLeave={handlePointterLeave}
      onPointerDown={handlePointterDown}
      onPointerUp={handlePointerUp}
      className="border-red-400 w-full min-h-screen"
    >
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
      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector setReaction={setReaction} />
      )}
      <LiveCursor others={others} />
    </div>
  );
};
