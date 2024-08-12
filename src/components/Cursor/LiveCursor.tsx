import { LiveCursorProps } from "../../type/type";
import { COLORS } from "../../utils";
import Cursor from "./Cursor";

export const LiveCursor = ({ others }: LiveCursorProps) => {
  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor) return null;
        return (
          <Cursor
            key={connectionId}
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
