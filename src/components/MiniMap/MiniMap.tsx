import React, { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";

interface MiniMapProps {
  mainFabricCanvas: fabric.Canvas | null;
}

const MiniMap: React.FC<MiniMapProps> = ({ mainFabricCanvas }) => {
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isUpdating, setIsUpdating] = useState(false); // Prevent multiple update triggers
  const [lastUpdateTime, setLastUpdateTime] = useState(0); // Throttle with timestamp

  const updateMiniMap = useCallback(() => {
    if (!mainFabricCanvas) return;

    const miniCanvas = miniCanvasRef.current;
    if (!miniCanvas) return;

    const ctx = miniCanvas.getContext("2d");
    if (!ctx) return;

    const scale = 0.2; // giảm quy mô mini-map để vẽ nhanh hơn
    miniCanvas.width = mainFabricCanvas.getWidth() * scale;
    miniCanvas.height = mainFabricCanvas.getHeight() * scale;

    // Draw mini-map using the main canvas snapshot
    const dataURL = mainFabricCanvas.toDataURL({ format: "png" });
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
      ctx.drawImage(img, 0, 0, miniCanvas.width, miniCanvas.height);
      setIsUpdating(false); // Reset the flag after update
    };
    img.src = dataURL;
  }, [mainFabricCanvas]);

  const handleCanvasChange = useCallback(() => {
    const now = Date.now();
    // Throttle the updates to avoid excessive redraws
    if (now - lastUpdateTime > 150) {
      // 150ms throttle (increase for more delay)
      setLastUpdateTime(now);
      if (!isUpdating) {
        setIsUpdating(true); // Set flag to prevent overlapping updates
        requestAnimationFrame(updateMiniMap); // Use requestAnimationFrame for smoother redraws
      }
    }
  }, [isUpdating, lastUpdateTime, updateMiniMap]);

  useEffect(() => {
    if (!mainFabricCanvas) return;

    // Attach event listeners for object modifications and additions
    mainFabricCanvas.on("object:modified", handleCanvasChange);
    mainFabricCanvas.on("object:added", handleCanvasChange);

    return () => {
      mainFabricCanvas.off("object:modified", handleCanvasChange);
      mainFabricCanvas.off("object:added", handleCanvasChange);
    };
  }, [handleCanvasChange, mainFabricCanvas]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        background: "#fff",
        padding: 4,
        border: "1px solid #ccc",
        zIndex: 10,
      }}
    >
      <canvas ref={miniCanvasRef} />
    </div>
  );
};

export default MiniMap;
