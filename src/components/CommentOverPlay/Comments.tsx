import { ClientSideSuspense } from "@liveblocks/react";
import CommentsOverlay from "./CommentOverplay";

export const Comments = () => {
  return (
    <ClientSideSuspense fallback={null}>
      {() => <CommentsOverlay />}
    </ClientSideSuspense>
  );
};
