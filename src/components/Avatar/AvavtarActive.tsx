import { useOthers, useSelf } from "@liveblocks/react";
import { Avatar } from "./Avatar";

export const ActiveUser = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  return (
    <main className="flex h-screen w-full select-none place-content-center place-items-center">
      <div className="flex pl-3">
        {users.slice(0, 3).map(({ connectionId, info }) => {
          return (
            <Avatar key={connectionId} src={info.avatar} name={info.name} />
          );
        })}

        {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}

        {currentUser && (
          <div className="relative ml-8 first:ml-0">
            <Avatar src={currentUser.info.avatar} name="You" />
          </div>
        )}
      </div>
    </main>
  );
};
