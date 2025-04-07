import { FormEvent, ReactNode, useCallback, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as Portal from "@radix-ui/react-portal";
import { ComposerSubmitComment } from "@liveblocks/react-comments/primitives";

import PinnedComposer from "../CommentOverPlay/PinnedComposer";
import NewThreadCursor from "../CommentOverPlay/NewThreadCursor";
import { useMaxZIndex } from "../../hook/useMaxZIndex";
import { useCreateThread } from "@liveblocks/react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

type ComposerCoords = null | { x: number; y: number };

type Props = {
  children: ReactNode;
};

export const NewThread = ({ children }: Props) => {
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const [creatingCommentState, setCreatingCommentState] = useState<
    "placing" | "placed" | "complete"
  >("complete");

  const createThread = useCreateThread();
  const maxZIndex = useMaxZIndex();

  const [composerCoords, setComposerCoords] = useState<ComposerCoords>(null);

  const handleCanvasClick = (e: MouseEvent) => {
    // Transition to "placed" when the user clicks on the canvas
    const canvas = document.querySelector("#canvas");
    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }

    const { top, left } = canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    setComposerCoords({ x, y });
    setCreatingCommentState("placed");
  };

  const handleComposerSubmit = useCallback(
    ({ body }: ComposerSubmitComment, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!composerCoords || !currentUser) {
        console.error("Composer coordinates or user is missing.");
        return;
      }

      const payload = {
        body,
        metadata: {
          x: composerCoords.x,
          y: composerCoords.y,
          resolved: false,
          zIndex: maxZIndex + 1,
          userId: currentUser.sub,
          userName: currentUser.name,
          userAvatar: currentUser.picture,
        },
      };

      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      createThread(payload);

      setComposerCoords(null);
      setCreatingCommentState("complete");
    },
    [createThread, composerCoords, maxZIndex, currentUser]
  );

  return (
    <>
      <Slot
        onClick={() => {
          if (creatingCommentState === "complete") {
            setCreatingCommentState("placing");
          }
        }}
        style={{ opacity: creatingCommentState !== "complete" ? 0.7 : 1 }}
      >
        {children}
      </Slot>

      {creatingCommentState === "placing" && (
        <div
          id="canvas"
          className="absolute inset-0"
          onClick={(e) => handleCanvasClick(e)}
        >
          {/* Canvas area */}
        </div>
      )}

      {composerCoords && creatingCommentState === "placed" ? (
        <Portal.Root
          className="absolute left-0 top-0"
          style={{
            transform: `translate(${composerCoords.x}px, ${composerCoords.y}px)`,
          }}
        >
          <PinnedComposer onComposerSubmit={handleComposerSubmit} />
        </Portal.Root>
      ) : null}

      <NewThreadCursor display={creatingCommentState === "placing"} />
    </>
  );
};
