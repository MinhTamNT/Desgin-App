import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { LiveCursor } from "../Cursor/LiveCursor";

export const Live = () => {
  const others = useOthers();
  const [{ cursor }, updatePersence] = useMyPresence() as any;
  return (
    <div>
      <LiveCursor others={others} />
    </div>
  );
};
