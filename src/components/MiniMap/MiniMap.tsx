import React, { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";

interface MiniMapProps {
  mainFabricCanvas: fabric.Canvas | null;
}

const MiniMap: React.FC<MiniMapProps> = ({ mainFabricCanvas }) => {
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const updateTimeoutRef = useRef<number | null>(null);

  // More robust update function that avoids tainted canvas issues
  const updateMiniMap = useCallback(() => {
    if (!mainFabricCanvas || !miniCanvasRef.current) {
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const miniCanvas = miniCanvasRef.current;
      const ctx = miniCanvas.getContext("2d");
      if (!ctx) return;

      // Fixed size for minimap
      const MINI_WIDTH = 200;
      const aspectRatio = mainFabricCanvas.getWidth() / mainFabricCanvas.getHeight();
      const MINI_HEIGHT = MINI_WIDTH / aspectRatio;
      
      miniCanvas.width = MINI_WIDTH;
      miniCanvas.height = MINI_HEIGHT;
      
      ctx.clearRect(0, 0, MINI_WIDTH, MINI_HEIGHT);
      
      const objects = mainFabricCanvas.getObjects();
      
      const vpt = mainFabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const zoom = mainFabricCanvas.getZoom() || 1;
      
      const canvasWidth = mainFabricCanvas.getWidth();
      const canvasHeight = mainFabricCanvas.getHeight();
      
    
      const viewOffsetX = vpt[4] / zoom;
      const viewOffsetY = vpt[5] / zoom;
      
      const scaleX = MINI_WIDTH / canvasWidth;
      const scaleY = MINI_HEIGHT / canvasHeight;
      
      if (objects.length > 0 || mainFabricCanvas.backgroundColor) {
        try {
          // Draw background
          if (mainFabricCanvas.backgroundColor) {
            ctx.fillStyle = mainFabricCanvas.backgroundColor.toString();
          } else {
            ctx.fillStyle = "#ffffff";
          }
          ctx.fillRect(0, 0, MINI_WIDTH, MINI_HEIGHT);
          
          const sortedObjects = [...objects].sort((a, b) => {
            return ((a as any).zIndex || 0) - ((b as any).zIndex || 0);
          });
          
          // Draw each object
          sortedObjects.forEach(obj => {
            if (!obj.visible) return;

            ctx.save();
            
            let left = obj.left || 0;
            let top = obj.top || 0;
            let width = obj.getScaledWidth ? obj.getScaledWidth() : (obj.width || 10);
            let height = obj.getScaledHeight ? obj.getScaledHeight() : (obj.height || 10);
            let angle = obj.angle || 0;
            
            const originX = obj.originX || 'left';
            const originY = obj.originY || 'top';
            
            const adjustedLeft = left - viewOffsetX;
            const adjustedTop = top - viewOffsetY;
            
            // Apply scaling to the minimap
            const miniX = adjustedLeft * scaleX;
            const miniY = adjustedTop * scaleY;
            const miniWidth = width * scaleX;
            const miniHeight = height * scaleY;
            
            // Set fill and stroke styles
            const fill = obj.fill || "#aaaaaa";
            ctx.fillStyle = fill.toString();
            
            if (obj.stroke) {
              ctx.strokeStyle = obj.stroke.toString();
              ctx.lineWidth = Math.max(1, (obj.strokeWidth || 1) * scaleX);
            }
            
            // Apply rotation if needed
            if (angle !== 0) {
              ctx.translate(miniX, miniY);
              ctx.rotate((angle * Math.PI) / 180);
              ctx.translate(-miniX, -miniY);
            }
            
            // Process different shape types
            const offsetX = originX === 'center' ? -miniWidth/2 : 0;
            const offsetY = originY === 'center' ? -miniHeight/2 : 0;
            
            // Check shape type
            const objType = obj.type?.toLowerCase() || '';
            
            // Enable drawing mode for all objects
            ctx.beginPath();
            
            if (objType === "circle") {
              const radius = ((obj as any).radius || 5) * scaleX;
              ctx.arc(miniX, miniY, radius, 0, Math.PI * 2);
              ctx.fill();
              if (obj.stroke) ctx.stroke();
            } 
            else if (objType === "rect") {
              ctx.fillRect(
                miniX + offsetX, 
                miniY + offsetY, 
                miniWidth, 
                miniHeight
              );
              
              if (obj.stroke) {
                ctx.strokeRect(
                  miniX + offsetX, 
                  miniY + offsetY, 
                  miniWidth, 
                  miniHeight
                );
              }
            } 
            else if (objType === "triangle") {
              ctx.moveTo(miniX + offsetX, miniY + miniHeight + offsetY);
              ctx.lineTo(miniX + miniWidth + offsetX, miniY + miniHeight + offsetY);
              ctx.lineTo(miniX + (miniWidth/2) + offsetX, miniY + offsetY);
              ctx.closePath();
              ctx.fill();
              if (obj.stroke) ctx.stroke();
            } 
            else if (objType === "line") {
              // Special handling for line objects
              try {
                const x1 = ((obj as any).x1 || 0) * scaleX;
                const y1 = ((obj as any).y1 || 0) * scaleY;
                const x2 = ((obj as any).x2 || width) * scaleX;
                const y2 = ((obj as any).y2 || height) * scaleY;
                
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = Math.max(1, (obj.strokeWidth || 1) * scaleX);
                ctx.stroke();
              } catch (err) {
                ctx.moveTo(miniX, miniY);
                ctx.lineTo(miniX + miniWidth, miniY + miniHeight);
                ctx.stroke();
              }
            }
            else if (objType === "path") {
              ctx.arc(miniX, miniY, 3, 0, Math.PI * 2);
              ctx.fill();
              
              if ((obj as any).path) {
                try {
                  const path = (obj as any).path;
                  
                    if (Array.isArray(path) && path.length > 0) {
                    ctx.beginPath();
                    
                    const firstPoint = path[0];
                    if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
                      ctx.moveTo(
                        (firstPoint[1] * scaleX) + miniX, 
                        (firstPoint[2] * scaleY) + miniY
                      );
                      
                      // Draw lines to subsequent points
                      for (let i = 1; i < path.length; i++) {
                        const point = path[i];
                        if (Array.isArray(point) && point.length >= 2) {
                          ctx.lineTo(
                            (point[1] * scaleX) + miniX, 
                            (point[2] * scaleY) + miniY
                          );
                        }
                      }
                      
                      ctx.stroke();
                    }
                  }
                } catch (err) {
                  // Fallback already drawn above
                }
              }
            }
            else if (objType === "image") {
              try {
                const imgElement = (obj as fabric.Image).getElement() as HTMLImageElement;
                if (imgElement && imgElement.complete) {
                  // Draw the image on the minimap
                  ctx.drawImage(
                    imgElement,
                    miniX + offsetX,
                    miniY + offsetY,
                    miniWidth,
                    miniHeight
                  );
                } else {
                  ctx.fillStyle = "#cccccc";
                  ctx.fillRect(
                    miniX + offsetX, 
                    miniY + offsetY, 
                    miniWidth, 
                    miniHeight
                  );
                  ctx.strokeRect(
                    miniX + offsetX, 
                    miniY + offsetY, 
                    miniWidth, 
                    miniHeight
                  );
                }
              } catch (err) {
                console.warn("Error drawing image in minimap:", err);
                // Fallback for error cases
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(
                  miniX + offsetX, 
                  miniY + offsetY, 
                  miniWidth, 
                  miniHeight
                );
              }
            }
            else {
              // Fallback for other types
              ctx.fillRect(
                miniX + offsetX, 
                miniY + offsetY, 
                miniWidth, 
                miniHeight
              );
            }
            
            ctx.restore();
          });
          
          setIsVisible(true);
        } catch (err) {
          console.warn("Error drawing object in minimap:", err);
          // Continue execution, don't return
        }
      } else {
        // If canvas is empty, just show an empty minimap
        ctx.fillStyle = "#f8f8f8";
        ctx.fillRect(0, 0, MINI_WIDTH, MINI_HEIGHT);
        ctx.strokeStyle = "#ddd";
        ctx.strokeRect(0, 0, MINI_WIDTH, MINI_HEIGHT);
        ctx.fillStyle = "#ccc";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Empty Canvas", MINI_WIDTH/2, MINI_HEIGHT/2);
        setIsVisible(true);
      }
    } catch (err) {
      console.error("Minimap error:", err);
    } finally {
      setIsUpdating(false);
    }
  }, [mainFabricCanvas]);

  // Debounced update function to prevent too many updates
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      window.clearTimeout(updateTimeoutRef.current);
    }
    
    // Schedule update after 100ms of inactivity
    updateTimeoutRef.current = window.setTimeout(() => {
      updateMiniMap();
      updateTimeoutRef.current = null;
    }, 100);
  }, [updateMiniMap]);

  // Set up all the necessary event listeners
  useEffect(() => {
    if (!mainFabricCanvas) return;
    
    updateMiniMap();
    
    const events = [
      "object:modified",
      "object:added",
      "object:removed",
      "canvas:cleared",
      "after:render",
      "zoom:changed",
      "viewport:translate"
    ];
    
    // Register all event listeners
    events.forEach(eventName => {
      mainFabricCanvas.on(eventName, debouncedUpdate);
    });
    
    // Set up a periodic refresh to ensure minimap stays updated
    const refreshInterval = setInterval(updateMiniMap, 5000);
    
    // Clean up function
    return () => {
      if (updateTimeoutRef.current) {
        window.clearTimeout(updateTimeoutRef.current);
      }
      clearInterval(refreshInterval);
      
      // Remove all event listeners
      events.forEach(eventName => {
        mainFabricCanvas.off(eventName, debouncedUpdate);
      });
    };
  }, [mainFabricCanvas, debouncedUpdate, updateMiniMap]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        background: "#fff",
        padding: 4,
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        zIndex: 10,
        display: isVisible ? "block" : "none",
        transition: "opacity 0.3s ease-in-out",
        opacity: isUpdating ? 0.7 : 1,
      }}
    >
      <canvas 
        ref={miniCanvasRef} 
        style={{
          display: "block",
          width: "200px",
          height: "auto",
        }}
      />
    </div>
  );
};

export default MiniMap;
