import { useThreads } from "@liveblocks/react";
import { Composer, Thread } from "@liveblocks/react-ui";
export const CommentOverPlay = () => {
  const { threads } = useThreads();
  return (
    <div>
      {threads?.map((thread) => (
        <Thread key={thread.id} thread={thread} />
      ))}
      {/* <Composer /> */}
    </div>
  );
};
