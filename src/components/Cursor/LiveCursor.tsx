import { LiveCursorProps } from "../../type/type";
import { COLORS } from "../../utils";
import Cursor from "./Cursor";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useEffect } from "react";
export const LiveCursor = ({ others }: LiveCursorProps) => {
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    if (currentUser) {
      updateMyPresence({
        name: currentUser.name,
        picture: currentUser.picture,
      });
    }
  }, [currentUser, updateMyPresence]);

  useEffect(() => {
    const timeoutIds: Record<string, NodeJS.Timeout> = {};

    others.forEach(({ connectionId, presence }) => {
      if (presence.cursor) {
        clearTimeout(timeoutIds[connectionId]);

        timeoutIds[connectionId] = setTimeout(() => {
          updateMyPresence({ cursor: null });
        }, 5000);
      }
    });

    return () => {
      Object.values(timeoutIds).forEach(clearTimeout);
    };
  }, [others, updateMyPresence]);

  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) return null;
        return (
          <Cursor
            key={connectionId}
            name={presence.name}
            color={COLORS[Number(connectionId) % COLORS.length]}
            x={presence.cursor.x}
            y={presence.cursor.y}
            message={presence.message}
          />
        );
      })}
    </>
  );
};
