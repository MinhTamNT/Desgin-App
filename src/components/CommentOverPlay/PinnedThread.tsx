import { ThreadData } from "@liveblocks/client";
import { ThreadMetadata } from "../../../liveblocks.config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Thread } from "@liveblocks/react-ui";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { useUpdateMyPresence } from "@liveblocks/react";
import './ThreadCustomStyles.css';
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
    if (currentUser && updateMyPresence) {
      try {
        updateMyPresence({
          name: currentUser.name,
          picture: currentUser.picture
        });
        console.log('Updated presence with user data:', currentUser.name);
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    }
  }, [currentUser, updateMyPresence]);
  // Hook debug u0111u1ec3 theo du00f5i khi nu00e0o thread.metadata.userName cu00f3 su1eb5n
  useEffect(() => {
    if (thread && thread.metadata) {
      console.log('Thread metadata available:', {
        threadId: thread.id,
        userName: thread.metadata.userName,
        userId: thread.metadata.userId,
        hasMetadata: !!thread.metadata
      });
    }
  }, [thread]);

  useEffect(() => {
    const removeAnonymousText = () => {
      const anonymousElements = document.querySelectorAll('.lb-comment-details-labels');
      
      if (anonymousElements.length > 0) {
        console.log(`Found ${anonymousElements.length} anonymous elements to replace`);
      }
      let userName = null;
      if (thread && thread.metadata && thread.metadata.userName) {
        userName = thread.metadata.userName;
        console.log('Using userName from thread metadata:', userName);
      } 
      else if (currentUser && currentUser.name) {
        userName = currentUser.name;
        console.log('Fallback to currentUser name:', userName);
      }
      else {
        try {
          const userJson = localStorage.getItem('currentUser');
          if (userJson) {
            const user = JSON.parse(userJson);
            if (user && user.name) {
              userName = user.name;
              console.log('Fallback to localStorage user name:', userName);
            }
          }
        } catch (e) {
          console.error('Failed to get user from localStorage:', e);
        }
      }
      
      if (!userName) {
        userName = 'Ngu01b0u1eddi du00f9ng';
        console.log('Using default user name');
      }
      
      anonymousElements.forEach(element => {
        if (element.textContent?.includes('Anonymous')) {
          console.log(`Replacing Anonymous in element with: ${userName}`, {
            elementText: element.textContent,
            element: element,
            threadId: thread?.id
          });
          
          element.textContent = userName;
          if (element instanceof HTMLElement) {
            element.style.color = '#0369a1';
            element.style.fontWeight = '500';
          }
        }
      });
    };

    removeAnonymousText();
    const intervalId = setInterval(removeAnonymousText, 200);
    
    return () => clearInterval(intervalId);
  }, [thread, currentUser]);
  
  

  const startMinimized = useMemo(
    () => Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread]
  );
  const [minimized, setMinimized] = useState(startMinimized);
  const handleThreadClick = useCallback((e: React.MouseEvent) => {
    onFocus(thread.id);

    if (
      e.target &&
      e.target instanceof HTMLElement &&
      e.target.classList.contains("lb-icon") &&
      e.target.classList.contains("lb-button-icon")
    ) {
      return;
    }

    setMinimized(!minimized);
  }, [thread.id, onFocus, minimized]);

  const memoizedContent = useMemo(
    () => (
      <div
        className="absolute flex cursor-pointer gap-4 z-10"
        {...props}
        onClick={handleThreadClick}
      >
        <div
          className="relative flex h-9 w-9 select-none items-center justify-center rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full bg-white shadow"
          data-draggable={true}
        >
          {thread.metadata.userAvatar ? (
            <img
              src={thread.metadata.userAvatar}
              width={28}
              height={28}
              className="rounded-full"
              alt={thread.metadata.userName || 'User'}
            />
          ) : currentUser && currentUser.picture ? (
            <img
              src={currentUser.picture}
              width={28}
              height={28}
              className="rounded-full"
              alt={currentUser.name || 'User'}
            />
          ) : (
            <div className="rounded-full bg-gray-300 w-7 h-7"></div>
          )}
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
              showComposer={true}
              className="custom-thread"
            />
            
            <div className="thread-creator-info">
              <span className="font-medium">Người tạo: {thread.metadata.userName}</span>
            </div>
            

          </div>
        ) : null}
      </div>
    ),
    [thread.comments.length, minimized]
  );
  return <>{memoizedContent}</>;
};
