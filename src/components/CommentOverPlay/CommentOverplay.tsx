import { ThreadData } from "@liveblocks/client";
import { useUser } from "@liveblocks/react";
import { useEditThreadMetadata, useThreads } from "@liveblocks/react/suspense";
import { useCallback, useEffect, useRef } from "react";
import { ThreadMetadata } from "../../../liveblocks.config";
import { useMaxZIndex } from "../../hook/useMaxZIndex";
import { PinnedThread } from "./PinnedThread";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

type OverPlayProp = {
  thread: ThreadData<ThreadMetadata>;
  maxZIndex: number;
};

const CommentsOverlay = () => {
  const { threads } = useThreads();
  const currentUser = useSelector((state: RootState) => state?.user?.user?.currentUser);
  
  const maxZIndex = useMaxZIndex();

  return (
    <div>
      {threads
        .filter((thread) => !thread.metadata.resolved)
        .map((thread) => (
          <OverlayThread
            key={thread.id}
            thread={thread}
            maxZIndex={maxZIndex}
          />
        ))}
    </div>
  );
};

const OverlayThread = ({ thread, maxZIndex }: OverPlayProp) => {
  const editThreadMetadata = useEditThreadMetadata();
  const user = useSelector((state: RootState) => state.user.user.currentUser);
  const { isLoading } = useUser(user?.sub);

  const threadRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (thread && user && !isLoading) {
      if (!thread.metadata.userName || !thread.metadata.userAvatar) {
        
        editThreadMetadata({
          threadId: thread.id,
          metadata: {
            ...thread.metadata,
            userId: thread.metadata.userId || user.sub,
            userName: thread.metadata.userName || user.name,
            userAvatar: thread.metadata.userAvatar || user.picture
          },
        });
      }
    }
  }, [thread, user, isLoading, editThreadMetadata]);

  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return;
    }

    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
  }, [thread, editThreadMetadata, maxZIndex]);

  if (isLoading) {
    return null;
  }

  const x = thread.metadata.x;
  const y = thread.metadata.y;
  
  const userName = thread.metadata.userName || 'Người dùng';
  const userAvatar = thread.metadata.userAvatar || '';
  
  const customClassWithUserAvatar = userAvatar ? 
    `thread-${thread.id}-user-${userName.replace(/\s+/g, '-').toLowerCase()}` : '';
  
  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className={`flex gap-5 ${customClassWithUserAvatar}`}
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: thread.metadata.zIndex || 1000,
        transform: 'translate(-50%, -50%)',
        margin: 0,
        padding: 0,
        '--user-avatar': `url(${userAvatar})`
      } as React.CSSProperties}
    >
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
};
export default CommentsOverlay;
