import { ClientSideSuspense } from "@liveblocks/react";
import { CommentOverPlay } from "./CommentOverplay";

export const Comments = () => {
  return (
    <ClientSideSuspense fallback={null}>
      {() => <CommentOverPlay />}
    </ClientSideSuspense>
  );
};
