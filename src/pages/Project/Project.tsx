import { LiveMap } from "@liveblocks/client";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { Live } from "../../components/Live/Live";
import LeftSidebar from "../../layout/Project/LeftSidebar";
import NavbarProject from "../../layout/Project/NavbarProject";
import RightSidebar from "../../layout/Project/RightSidebar";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "../../lib/cavans";
import { ActiveElement } from "../../type/type";
import { defaultNavElement } from "../../utils";
import { handleDelete, handleKeyDown } from "../../utils/Key/key-event";

export const Project = () => {
  const undo = useUndo();
  const redo = useRedo();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });
  const activeObjectRef = useRef<fabric.Object | null>(null);

  // Explicitly type canvasObjects as LiveMap
  const canvasObjects = useStorage((root) => root.canvasObjects) as LiveMap<
    string,
    any
  >;

  const syncShapeInStorage = useMutation(({ storage }, object) => {
    if (!object) return;

    const { objectId } = object;
    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects") as LiveMap<string, any>;
    if (canvasObjects && canvasObjects.set) {
      canvasObjects.set(objectId, shapeData);
    } else {
      console.error(
        "canvasObjects is not a LiveMap or doesn't have a set method"
      );
    }
  }, []);

  const deleteAllShapes = useMutation(({ storage }) => {
    const canvasObjects = storage.get("canvasObjects") as LiveMap<string, any>;

    if (!canvasObjects || canvasObjects.size === 0) {
      return true;
    }

    // Using a type-safe way to iterate and delete entries
    for (const [key] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }
    return canvasObjects.size === 0;
  }, []);

  const deleteShapeFromStorage = useMutation(({ storage }, object) => {
    const canvasObjects = storage.get("canvasObjects") as LiveMap<string, any>;
    if (canvasObjects) {
      canvasObjects.delete(object);
    }
  }, []);

  const handleActiveElement = (element: ActiveElement) => {
    setActiveElement(element);
    selectedShapeRef.current = element?.value as string;

    switch (element?.value) {
      case "reset":
        deleteAllShapes();
        fabricRef?.current?.clear();
        setActiveElement(defaultNavElement);
        break;
      case "delete":
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        setActiveElement(defaultNavElement);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    if (canvas) {
      console.log("canvas init", canvas.on);
      canvas.on("mouse:down", (options) => {
        console.log("mouse down");
        handleCanvasMouseDown({
          options,
          canvas,
          selectedShapeRef,
          isDrawing,
          shapeRef,
        });
      });
      canvas.on("mouse:move", (options) => {
        console.log("mouse down");
        handleCanvaseMouseMove({
          options,
          canvas,
          isDrawing,
          shapeRef,
          selectedShapeRef,
          syncShapeInStorage,
        });
      });
      canvas.on("mouse:up", (options) => {
        console.log("mouse down");
        handleCanvasMouseUp({
          canvas,
          isDrawing,
          shapeRef,
          selectedShapeRef,
          syncShapeInStorage,
          setActiveElement,
          activeObjectRef,
        });
      });

      canvas.on("object:modified", (options) => {
        console.log("Object Modified");
        handleCanvasObjectModified({
          options,
          syncShapeInStorage,
        });
      });

      const handleResizeEvent = () => {
        handleResize({ canvas: fabricRef.current });
      };

      window.addEventListener("resize", handleResizeEvent);
      window.addEventListener("keydown", (e) => {
        handleKeyDown({
          e,
          canvas,
          undo,
          redo,
          syncShapeInStorage,
          deleteShapeFromStorage,
        });
      });

      return () => {
        window.removeEventListener("resize", handleResizeEvent);
      };
    } else {
      console.log("Canvas not initialized");
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvasObjects) {
      renderCanvas({ fabricRef, activeObjectRef, canvasObjects });
    } else {
      console.warn("canvasObjects is null or undefined");
    }
  }, [canvasObjects]);

  console.log("canvasRef Change", canvasRef);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <main className="h-screen overflow-hidden">
      <NavbarProject
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        handleImageUpload={handleImageUpload}
        imageInputRef={imageInputRef}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar allShape={Array.from(canvasObjects ?? "")} />
        <Live canvasRef={canvasRef} />
        <RightSidebar />
      </section>
    </main>
  );
};
