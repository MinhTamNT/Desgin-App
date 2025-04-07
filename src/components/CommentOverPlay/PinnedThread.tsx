import { ThreadData } from "@liveblocks/client";
import { ThreadMetadata } from "../../../liveblocks.config";
import { useEffect, useMemo, useState } from "react";
import { Thread } from "@liveblocks/react-ui";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useUpdateMyPresence } from "@liveblocks/react";
type Props = {
  thread: ThreadData<ThreadMetadata>;
  onFocus: (threadId: string) => void;
};

export const PinnedThread = ({ thread, onFocus, ...props }: Props) => {
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
  }, [currentUser]);

  const startMinimized = useMemo(
    () => Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread]
  );
  const [minimized, setMinimized] = useState(startMinimized);
  const memoizedContent = useMemo(
    () => (
      <div
        className="absolute flex cursor-pointer gap-4"
        {...props}
        onClick={(e: any) => {
          onFocus(thread.id);

          if (
            e.target &&
            e.target.classList.contains("lb-icon") &&
            e.target.classList.contains("lb-button-icon")
          ) {
            return;
          }

          setMinimized(!minimized);
        }}
      >
        <div
          className="relative flex h-9 w-9 select-none items-center justify-center rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow"
          data-draggable={true}
        >
          <img
            src={currentUser.picture}
            width={28}
            height={28}
            className="rounded-full"
          />
        </div>
        {!minimized ? (
          <div className="flex min-w-60 flex-col overflow-hidden rounded-lg bg-white text-sm shadow">
            <Thread
              key={thread.id}
              thread={thread}
              indentCommentContent={false}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        ) : null}
      </div>
    ),
    [thread.comments.length, minimized]
  );
  return <>{memoizedContent}</>;
};
