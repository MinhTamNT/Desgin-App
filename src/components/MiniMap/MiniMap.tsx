import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface MiniMapProps {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
}

const MiniMap: React.FC<MiniMapProps> = ({ canvasRef }) => {
  const miniMapRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const updateMiniMap = () => {
      const mainCanvas = canvasRef.current;
      const miniMapCanvas = miniMapRef.current;

      if (mainCanvas && miniMapCanvas) {
        const context = miniMapCanvas.getContext("2d");
        if (!context) return;

        console.log("Updating MiniMap...");

        // Clear MiniMap
        context.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);

        // Scale down the main canvas content
        const scale = 0.2; // Adjust scale as needed
        miniMapCanvas.width = mainCanvas.width * scale;
        miniMapCanvas.height = mainCanvas.height * scale;

        console.log("MiniMap size:", miniMapCanvas.width, miniMapCanvas.height);

        // Draw main canvas content onto MiniMap
        const dataURL = mainCanvas.toDataURL();
        console.log("Canvas Data URL:", dataURL);

        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0, miniMapCanvas.width, miniMapCanvas.height);
          console.log("MiniMap updated");
        };
        img.src = dataURL;
      }
    };

    const mainCanvas = canvasRef.current;
    if (mainCanvas) {
      mainCanvas.on("object:modified", updateMiniMap);
      mainCanvas.on("mouse:down", updateMiniMap);
      updateMiniMap(); // Gọi ngay khi component được render
    }

    return () => {
      if (mainCanvas) {
        mainCanvas.off("object:modified", updateMiniMap);
        mainCanvas.off("mouse:down", updateMiniMap);
      }
    };
  }, [canvasRef]);

  return (
    <div className="mini-map-container" style={{ position: "absolute", bottom: 10, right: 10 }}>
      <canvas ref={miniMapRef} style={{ border: "1px solid #ccc" }} />
    </div>
  );
};

export default MiniMap;