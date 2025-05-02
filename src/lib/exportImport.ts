import { fabric } from "fabric";
import { LiveMap } from "@liveblocks/client";
import { v4 as uuidv4 } from "uuid";

// Simple encryption/decryption using a key
const encryptionKey = "design-app-secure-key-2025";

const encryptData = (data: string): string => {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
};

const decryptData = (encryptedData: string): string => {
  try {
    // Decode from base64
    const data = atob(encryptedData);
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw new Error("Invalid encrypted data");
  }
};

// Function to export canvas to JSON
export const exportCanvasToJSON = (
  canvas: fabric.Canvas | null,
  canvasObjects: LiveMap<string, any> | null
): string => {
  if (!canvas) {
    throw new Error("Canvas is not initialized");
  }

  // Create the data structure for export
  const exportData = {
    canvasJSON: canvas.toJSON(['objectId', 'hasUploaded']),
    objectMap: Array.from(canvasObjects?.entries() || []),
    version: "1.0", // Version for future compatibility
    exportedAt: new Date().toISOString(),
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Encrypt the data
  return encryptData(jsonString);
};

// Function to download the exported JSON
export const downloadJSON = (jsonData: string, fileName: string = "design-export.json"): void => {
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
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
        
        const existingObjects = currentCanvas.getObjects();
        const existingCount = existingObjects.length;
        
        const importedObjects = tempCanvas.getObjects();
        
        let offsetX = 0;
        let offsetY = 0;
        
        if (!replaceExisting && existingCount > 0) {
          let maxRight = 0;
          existingObjects.forEach(obj => {
            const objRight = obj.left! + (obj.width! * obj.scaleX!);
            if (objRight > maxRight) {
              maxRight = objRight;
            }
          });
          
          offsetX = maxRight + 50;
        }
        
        importedObjects.forEach(obj => {
          const clonedObj = fabric.util.object.clone(obj);
          
          if (!replaceExisting) {
            clonedObj.set({
              left: (clonedObj.left || 0) + offsetX,
              top: (clonedObj.top || 0) + offsetY
            });
          }
          
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
