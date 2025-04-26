import { useEffect, useState } from "react";
import * as Portal from "@radix-ui/react-portal";

const DEFAULT_CURSOR_POSITION = -10000;

const NewThreadCursor = ({ display }: { display: boolean }) => {
  const [coords, setCoords] = useState({
    x: DEFAULT_CURSOR_POSITION,
    y: DEFAULT_CURSOR_POSITION,
  });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      const canvas = document.getElementById("canvas");

      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();

        if (
          e.clientX >= canvasRect.left &&
          e.clientX <= canvasRect.right &&
          e.clientY >= canvasRect.top &&
          e.clientY <= canvasRect.bottom
        ) {
          setCoords({
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top,
          });
        } else {  
          setCoords({
            x: DEFAULT_CURSOR_POSITION,
            y: DEFAULT_CURSOR_POSITION,
          });
        }
      }
    };

    if (display) {
      window.addEventListener("mousemove", updatePosition);
    }
    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, [display]);

  return (
    <Portal.Root>
      <div
        className="absolute pointer-events-none"
        style={{
          transform: `translate(${coords.x}px, ${coords.y}px)`,
          top: 0,
          left: 0,
        }}
      >
        {display && (
          <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg"></div>
        )}
      </div>
    </Portal.Root>
  );
};

export default NewThreadCursor;
