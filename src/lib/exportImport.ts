import { fabric } from "fabric";
import { LiveMap } from "@liveblocks/client";
import { v4 as uuidv4 } from "uuid";

const encryptionKey = "design-app-secure-key-2025";

const encryptData = (data: string): string => {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    const charCode =
      data.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
};

const decryptData = (encryptedData: string): string => {
  try {
    // Decode from base64
    const data = atob(encryptedData);
    let result = "";
    for (let i = 0; i < data.length; i++) {
      const charCode =
        data.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Invalid encrypted data");
  }
};

export const exportCanvasToJSON = (
  canvas: fabric.Canvas | null,
  canvasObjects: LiveMap<string, any> | null
): string => {
  if (!canvas) {
    throw new Error("Canvas is not initialized");
  }

  const exportData = {
    canvasJSON: canvas.toJSON(["objectId", "hasUploaded"]),
    objectMap: Array.from(canvasObjects?.entries() || []),
    version: "1.0",
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportData, null, 2);

  return encryptData(jsonString);
};

export const downloadJSON = (
  jsonData: string,
  fileName: string = uuidv4()
): void => {
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

export const importCanvasFromJSON = async (
  jsonData: string,
  fabricRef: React.MutableRefObject<fabric.Canvas | null>,
  syncShapeInStorage: (object: fabric.Object) => void,
  deleteAllShapes: () => boolean | Promise<boolean>,
  replaceExisting: boolean = false
): Promise<boolean> => {
  try {
    const decryptedData = decryptData(jsonData);
    const importData = JSON.parse(decryptedData);

    if (!importData.canvasJSON || !fabricRef.current) {
      throw new Error("Invalid import data or canvas not initialized");
    }

    if (replaceExisting) {
      await Promise.resolve(deleteAllShapes());
      fabricRef.current.clear();
    }

    const tempCanvas = new fabric.Canvas(null);

    return new Promise((resolve) => {
      tempCanvas.loadFromJSON(importData.canvasJSON, () => {
        const currentCanvas = fabricRef.current;
        if (!currentCanvas) {
          resolve(false);
          return;
        }

        const importedObjects = tempCanvas.getObjects();
        
        if (importedObjects.length === 0) {
          resolve(true);
          return;
        }
        
        const bounds = {
          left: Number.MAX_VALUE,
          top: Number.MAX_VALUE,
          right: Number.MIN_VALUE,
          bottom: Number.MIN_VALUE
        };
        
        importedObjects.forEach(obj => {
          const objBounds = obj.getBoundingRect();
          bounds.left = Math.min(bounds.left, objBounds.left);
          bounds.top = Math.min(bounds.top, objBounds.top);
          bounds.right = Math.max(bounds.right, objBounds.left + objBounds.width);
          bounds.bottom = Math.max(bounds.bottom, objBounds.top + objBounds.height);
        });
        
        const importedCenterX = bounds.left + (bounds.right - bounds.left) / 2;
        const importedCenterY = bounds.top + (bounds.bottom - bounds.top) / 2;
        
        const canvasCenterX = currentCanvas.getWidth() / 2;
        const canvasCenterY = currentCanvas.getHeight() / 2;
        
        const offsetX = canvasCenterX - importedCenterX;
        const offsetY = canvasCenterY - importedCenterY;

        importedObjects.forEach((obj) => {
          const clonedObj = fabric.util.object.clone(obj);

          clonedObj.set({
            left: (clonedObj.left || 0) + offsetX,
            top: (clonedObj.top || 0) + offsetY,
          });

          if (!(clonedObj as any).objectId) {
            (clonedObj as any).objectId = uuidv4();
          }

          currentCanvas.add(clonedObj);
          syncShapeInStorage(clonedObj);
        });

        currentCanvas.renderAll();
        tempCanvas.dispose();
        resolve(true);
      });
    });
  } catch (error) {
    console.error("Error importing design:", error);
    return false;
  }
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
