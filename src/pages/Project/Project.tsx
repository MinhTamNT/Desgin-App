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
  handleCanvasObjectMoving,
  handleCanvasObjectScaling,
  handleCanvasSelectionCreated,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "../../lib/cavans";
import { handleImageUpload } from "../../lib/shape";
import { ActiveElement, Attributes } from "../../type/type";
import { defaultNavElement } from "../../utils";
import { handleDelete, handleKeyDown } from "../../utils/Key/key-event";
import { uploadImageToCloudinary } from "../../helper/UpdateImage";

export const Project = () => {
  const undo = useUndo();
  const redo = useRedo();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });
  const activeObjectRef = useRef<fabric.Object | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);
  const [elementAtrributes, setElementAtrributes] = useState<Attributes>({
    width: "",
    height: "",
    fontSize: "",
    fontFamily: "",
    fill: "#aabbcc",
    fontWeight: "",
    stroke: "#aabbcc",
  });
  const handleImageUploads = async (event: any) => {
    event.stopPropagation();
    const newImage = await uploadImageToCloudinary(event.target.files[0]);
    console.log(newImage);
    handleImageUpload({
      file: newImage?.url,
      canvas: fabricRef as any,
      shapeRef,
      syncShapeInStorage,
    });
  };
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
    if (canvasObjects) {
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
    console.log(element?.value);
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
      case "image":
        if (imageInputRef.current) {
          imageInputRef.current.click();
        }
        isDrawing.current = false;
        if (fabricRef.current) {
          fabricRef.current.isDrawingMode = false;
        }
        break;
      default:
        selectedShapeRef.current = element?.value as string;
        break;
    }
  };

  // useEffect(() => {
  //   const canvasElement = canvasRef.current;

  //   const handleDragOver = (event: DragEvent) => {
  //     event.preventDefault();
  //   };

  //   const handleDrop = async (event: DragEvent) => {
  //     event.preventDefault();

  //     if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
  //       const file = event.dataTransfer.files[0];

  //       if (file.type.startsWith("image/")) {
  //         const reader = new FileReader();
  //         reader.onload = (e) => {
  //           const imgElement = new Image();
  //           imgElement.src = e.target?.result as string;

  //           imgElement.onload = () => {
  //             const imgInstance = new fabric.Image(imgElement, {
  //               left: 50,
  //               top: 50,
  //             });

  //             fabricRef.current?.add(imgInstance);
  //             handleImageUploads(event);
  //           };
  //         };
  //         reader.readAsDataURL(file);
  //       }
  //     }
  //   };

  //   if (canvasElement) {
  //     canvasElement.addEventListener("dragover", handleDragOver);
  //     canvasElement.addEventListener("drop", handleDrop);
  //   }

  //   return () => {
  //     if (canvasElement) {
  //       canvasElement.removeEventListener("dragover", handleDragOver);
  //       canvasElement.removeEventListener("drop", handleDrop);
  //     }
  //   };
  // }, [canvasRef, syncShapeInStorage]);

  // useEffect(() => {
  //   const handlePaste = async (event: ClipboardEvent) => {
  //     const items = event.clipboardData?.items;

  //     if (items) {
  //       for (const item of items) {
  //         if (item.type.indexOf("image") !== -1) {
  //           const file = item.getAsFile();
  //           if (file) {
  //             const reader = new FileReader();
  //             reader.onload = (e) => {
  //               const imgElement = new Image();
  //               imgElement.src = e.target?.result as string;

  //               imgElement.onload = () => {
  //                 const imgInstance = new fabric.Image(imgElement, {
  //                   left: 50,
  //                   top: 50,
  //                 });

  //                 fabricRef.current?.add(imgInstance);
  //                 handleImageUploads(event);
  //               };
  //             };
  //             reader.readAsDataURL(file);
  //           }
  //         }
  //       }
  //     }
  //   };

  //   window.addEventListener("paste", handlePaste);

  //   return () => {
  //     window.removeEventListener("paste", handlePaste);
  //   };
  // }, [syncShapeInStorage]);

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    if (canvas) {
      console.log("canvas init", canvas.on);
      canvas.on("mouse:down", (options) => {
        handleCanvasMouseDown({
          options,
          canvas,
          selectedShapeRef,
          isDrawing,
          shapeRef,
        });
      });
      canvas.on("mouse:move", (options) => {
        handleCanvaseMouseMove({
          options,
          canvas,
          isDrawing,
          shapeRef,
          selectedShapeRef,
          syncShapeInStorage,
        });
      });
      canvas.on("mouse:up", (options: any) => {
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
        handleCanvasObjectModified({
          options,
          syncShapeInStorage,
        });
      });

      canvas.on("selection:created", (options: any) => {
        handleCanvasSelectionCreated({
          options,
          isEditingRef,
          setElementAttributes: setElementAtrributes,
        });
      });

      canvas.on("path:created", (options) => {
        handlePathCreated({
          options,
          syncShapeInStorage,
        });
      });

      canvas?.on("object:moving", (options) => {
        handleCanvasObjectMoving({
          options,
        });
      });

      canvas.on("object:scaling", (options) => {
        handleCanvasObjectScaling({
          options,
          setElementAttributes: setElementAtrributes,
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
        canvas.dispose();
        window.removeEventListener("resize", handleResizeEvent);
        window.removeEventListener("keydown", (e) =>
          handleKeyDown({
            e,
            canvas: fabricRef.current,
            undo,
            redo,
            syncShapeInStorage,
            deleteShapeFromStorage,
          })
        );
      };
    } else {
      console.log("Canvas not initialized");
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvasObjects) {
      renderCanvas({ fabricRef, activeObjectRef, canvasObjects });
    }
  }, [canvasObjects]);

  console.log("canvasRef Change", canvasRef);

  return (
    <main className="h-screen overflow-hidden">
      <NavbarProject
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        handleImageUpload={handleImageUploads}
        imageInputRef={imageInputRef}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar allShape={Array.from(canvasObjects ?? "")} />
        <Live canvasRef={canvasRef} />
        <RightSidebar
          elementAttributes={elementAtrributes}
          setElementAttributes={setElementAtrributes}
          fabricRef={fabricRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
          isEditingRef={isEditingRef}
        />
      </section>
    </main>
  );
};
