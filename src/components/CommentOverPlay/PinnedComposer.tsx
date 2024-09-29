import { useUpdateMyPresence } from "@liveblocks/react";
import { Composer, ComposerProps } from "@liveblocks/react-ui";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

type Props = {
  onComposerSubmit: ComposerProps["onComposerSubmit"];
};

const PinnedComposer = ({ onComposerSubmit, ...props }: Props) => {
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
  }, [currentUser, updateMyPresence]);

  return (
    <div className="absolute flex gap-4" {...props}>
      <div className="select-none relative w-9 h-9 shadow rounded-tl-md rounded-tr-full rounded-br-full rounded-bl-full bg-white flex justify-center items-center">
        <img
          src={currentUser.picture}
          width={28}
          height={28}
          className="rounded-full"
        />
      </div>
      <div className="shadow bg-white rounded-lg flex flex-col text-sm min-w-96 overflow-hidden p-2">
        <Composer
          onComposerSubmit={onComposerSubmit}
          autoFocus={true}
          onKeyUp={(e) => {
            e.stopPropagation();
          }}
        />
      </div>
    </div>
  );
};

export default PinnedComposer;
