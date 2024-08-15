import CursorSVG from "../../assets/CursorSVG";
import { CursorChatProps, CursorMode } from "../../type/type";

// cursorState.mode === CursorMode.Chat && (
export const CursorChat = ({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence,
}: CursorChatProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: e.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: e.target.value,
    });
  };
  const hanldeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage: cursorState.message,
        message: "",
      });
    } else if (e.key === "Escape") {
      setCursorState({
        mode: CursorMode.Hidden,
      });
    }
  };
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translatex(${cursor.x}px) translateY(${cursor.y}px)`,
      }}
    >
      {cursorState.mode === CursorMode.Chat && (
        <>
          <CursorSVG color="#000" />
          <div
            className="absolute left-2 top-5 bg-blue-600 px-4 py-2 text-sm leading-relaxed text-white rounded-md"
            onKeyUp={(e) => e.stopPropagation()}
          >
            {cursorState.previousMessage && (
              <div>{cursorState.previousMessage}</div>
            )}
            <input
              className="z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none"
              autoFocus={true}
              onChange={handleChange}
              onKeyDown={hanldeKeyDown}
              placeholder={
                cursorState?.previousMessage ? "" : "Type a message ..."
              }
              maxLength={50}
            />
          </div>
        </>
      )}
    </div>
  );
};
