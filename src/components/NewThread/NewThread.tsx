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
  // Make sure we can access the Liveblocks API
  if (!createThread) {
    console.error("createThread is unavailable - Liveblocks might not be properly initialized");
  }
  const maxZIndex = useMaxZIndex();

  const [composerCoords, setComposerCoords] = useState<ComposerCoords>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Sử dụng tọa độ tuyệt đối so với viewport để đảm bảo độ chính xác
    const canvas = document.querySelector("#canvas");
    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }

    // Lấy vị trí tuyệt đối của click trong viewport
    const viewportX = e.clientX;
    const viewportY = e.clientY;
    
    // Log thông tin để debug
    console.log("Comment pinned at viewport coordinates: x=", viewportX, "y=", viewportY);
    
    // Lưu tọa độ viewport làm tọa độ chính để đảm bảo độ chính xác
    setComposerCoords({ x: viewportX, y: viewportY });
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

      // Sử dụng chính xác tọa độ đã lưu khi click, không thay đổi tọa độ
      // Điều này đảm bảo vị trí pin sẽ giống vị trí nhập comment
      // Lưu tọa độ VIEWPORT để đảm bảo tính nhất quán
      // Điều này sẽ giúp thread hiển thị đúng ở vị trí người dùng đã click
      const payload = {
        body,
        metadata: {
          // Đây là tọa độ viewport (tọa độ màn hình)
          x: composerCoords.x,
          y: composerCoords.y,
          // Đánh dấu rằng đây là tọa độ viewport để xử lý khác nếu cần
          isViewportCoord: true,
          // Thêm thông tin về kích thước viewport khi tạo
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          resolved: false,
          zIndex: maxZIndex + 1,
          userId: currentUser.sub,
          userName: currentUser.name,
          userAvatar: currentUser.picture,
          createdAt: new Date().toISOString(), // Thu00eam thu1eddi gian tu1ea1o u0111u1ec3 u0111u1ea3m bu1ea3o su1eafp xu1ebfp
        },
      };

      // Log thông tin đầy đủ để debug
      console.log("Thread created with viewport coordinates:", {
        x: composerCoords.x,
        y: composerCoords.y,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      });

      console.log("Payload being sent:", JSON.stringify(payload, null, 2));
      
      try {
        createThread(payload);
        console.log("Thread created successfully");
      } catch (error) {
        console.error("Error creating thread:", error);
      }

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
          className="absolute inset-0 z-50 cursor-crosshair"
          onClick={(e) => handleCanvasClick(e)}
        >
          {/* Canvas area for pinning comments */}
        </div>
      )}

      {composerCoords && creatingCommentState === "placed" ? (
        <Portal.Root
          className="fixed left-0 top-0"
          style={{
            left: `${composerCoords.x}px`,
            top: `${composerCoords.y}px`,
            pointerEvents: 'auto',
            zIndex: 9999,
            position: 'fixed',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <PinnedComposer onComposerSubmit={handleComposerSubmit} />
        </Portal.Root>
      ) : null}

      <NewThreadCursor display={creatingCommentState === "placing"} />
    </>
  );
};
