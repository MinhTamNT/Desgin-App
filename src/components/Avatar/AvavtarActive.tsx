import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { Avatar } from "./Avatar";

export const ActiveUser = () => {
  const users = useOthers();
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const hasMoreUsers = users.length > 3;
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    if (currentUser) {
      updateMyPresence({
        name: currentUser.name,
        picture: currentUser.picture,
      });
    }
  }, [currentUser, updateMyPresence]);
  return (
    <main className="flex items-center h-[60px] justify-center gap-1 py-2">
      <div className="flex pl-3">
        {currentUser && (
          <Avatar name={currentUser?.name} src={currentUser?.picture} />
        )}
        {users.slice(0, 3).map((user: User<{}, { id: string; info: { name: string; avatar: string; status: string } }>) => {
          return (
            <Avatar
              key={user.connectionId}
              src={user.presence?.picture as string}
              name={user.presence?.name as string}
            />
          );
        })}
      </div>
      {hasMoreUsers && (
        <div className="pl-3">
          <span>+{users.length - 3} more</span>
        </div>
      )}
    </main>
  );
};
