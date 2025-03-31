import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastPointerEvent = useRef<PointerEvent>();

  const [allowUseComposer, setAllowUseComposer] = useState(false);
  const allowComposerRef = useRef(allowUseComposer);
  allowComposerRef.current = allowUseComposer;

  useEffect(() => {
    // Nếu bình luận đã được xác nhận, không làm gì cả
    if (isDragging === false && composerCoords) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setComposerCoords({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  useEffect(() => {
    if (creatingCommentState === "complete") {
      return;
    }

    const newComment = (e: MouseEvent) => {
      e.preventDefault();

      if (creatingCommentState === "placed") {
        const isClickOnComposer = ((e as any)._savedComposedPath = e
          .composedPath()
          .some((el: any) => {
            return el.classList?.contains("lb-composer-editor-actions");
          }));

        if (isClickOnComposer) {
          return;
        }

        if (!isClickOnComposer) {
          setCreatingCommentState("complete");
          return;
        }
      }

      setCreatingCommentState("placed");
      setComposerCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };

    document.documentElement.addEventListener("click", newComment);

    return () => {
      document.documentElement.removeEventListener("click", newComment);
    };
  }, [creatingCommentState]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Prevents issue with composedPath getting removed
      (e as any)._savedComposedPath = e.composedPath();
      lastPointerEvent.current = e;
    };

    document.documentElement.addEventListener("pointermove", handlePointerMove);

    return () => {
      document.documentElement.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, []);

  useEffect(() => {
    if (creatingCommentState !== "placing") {
      return;
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (allowComposerRef.current) {
        return;
      }

      (e as any)._savedComposedPath = e.composedPath();
      lastPointerEvent.current = e;
      setAllowUseComposer(true);
    };

    // Right click to cancel placing
    const handleContextMenu = (e: Event) => {
      if (creatingCommentState === "placing") {
        e.preventDefault();
        setCreatingCommentState("complete");
      }
    };

    document.documentElement.addEventListener("pointerdown", handlePointerDown);
    document.documentElement.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.documentElement.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
      document.documentElement.removeEventListener(
        "contextmenu",
        handleContextMenu
      );
    };
  }, [creatingCommentState]);

  // On composer submit, create thread and reset state
  const handleComposerSubmit = useCallback(
    ({ body }: ComposerSubmitComment, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!composerCoords || !lastPointerEvent.current) {
        return;
      }

      const overlayPanel = document.querySelector("#canvas");
      if (!overlayPanel) {
        console.error("Canvas element not found.");
        return;
      }

      const { top, left } = overlayPanel.getBoundingClientRect();
      const x = composerCoords.x - left;
      const y = composerCoords.y - top;

      const payload = {
        body,
        metadata: {
          x,
          y,
          resolved: false,
          zIndex: maxZIndex + 1,
        },
      };

      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      createThread(payload);

      setComposerCoords(null);
      setCreatingCommentState("complete");
      setAllowUseComposer(false);
    },
    [createThread, composerCoords, maxZIndex]
  );

  // const handleClick = (e: MouseEvent) => {
  //   if (!isDragging) {
  //     // Bắt đầu di chuyển
  //     setIsDragging(true);
  //     setComposerCoords({ x: e.clientX, y: e.clientY });
  //   } else {
  //     setIsDragging(false);
  //     createThread({
  //       x: composerCoords?.x || 0,
  //       y: composerCoords?.y || 0,
  //       zIndex: maxZIndex + 1,
  //     });
  //     setComposerCoords(null);
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener("click", handleClick);
  //   return () => {
  //     window.removeEventListener("click", handleClick);
  //   };
  // }, [isDragging, composerCoords]);

  return (
    <>
      <Slot
        onClick={() =>
          setCreatingCommentState(
            creatingCommentState !== "complete" ? "complete" : "placing"
          )
        }
        style={{ opacity: creatingCommentState !== "complete" ? 0.7 : 1 }}
      >
        {children}
      </Slot>

      {composerCoords && creatingCommentState === "placed" ? (
        <Portal.Root
          className="absolute left-0 top-0"
          style={{
            pointerEvents: allowUseComposer ? "initial" : "none",
            transform: `translate(${composerCoords.x}px, ${composerCoords.y}px)`,
          }}
          data-hide-cursors
        >
          <PinnedComposer onComposerSubmit={handleComposerSubmit} />
        </Portal.Root>
      ) : null}

      <NewThreadCursor display={creatingCommentState === "placing"} />
    </>
  );
};
