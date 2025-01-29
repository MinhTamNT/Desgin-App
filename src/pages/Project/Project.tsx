import { LiveMap } from "@liveblocks/client";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { Live } from "../../components/Live/Live";
import { uploadImageToCloudinary } from "../../helper/UpdateImage";
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
  handleCanvasZoom,
  handlePathCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "../../lib/cavans";
import { handleImageUpload } from "../../lib/shape";
import { ActiveElement, Attributes } from "../../type/type";
import { defaultNavElement } from "../../utils";
import { handleDelete, handleKeyDown } from "../../utils/Key/key-event";
import { RootState } from "../../Redux/store";
import { useSelector } from "react-redux";
import { NOTIFICATION_SUBSCRIPTION } from "../../utils/Notify/Notify";
import { useSubscription } from "@apollo/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface UserRequest {
  idUser: string;
}

export const Project = () => {
  const undo = useUndo();
  const redo = useRedo();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
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
  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  console.log(user?.sub);
  const userRole = useSelector(
    (state: RootState) => state?.role?.role?.userRole
  );
  console.log(userRole);
  const navigate = useNavigate();
  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data) {
        const newNotification = subscriptionData.data.notificationCreated;
        console.log("New Notification:", newNotification);

        const userIds = newNotification.userRequest.map(
          (idUser: UserRequest) => idUser.idUser === user?.sub
        );
        const isCheck = userIds.includes(true);
        console.log(isCheck);
        if (isCheck === false) {
          toast(newNotification.message);
          console.log("New Notification:", newNotification);
          setNotifications((prev) => [...prev, newNotification.message]);

          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });

  const handleImageUploads = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation();
    const file = event.target.files ? event.target.files[0] : "";
    try {
      const newImage = await uploadImageToCloudinary(file as string);
      if (newImage) {
        handleImageUpload({
          file: newImage?.url,
          canvas: fabricRef.current as any,
          shapeRef,
          syncShapeInStorage,
        });
      }
    } catch (error) {
      console.error("Error uploading the image:", error);
    }
  };
  const canvasObjects = useStorage((root) => root.canvasObjects) as LiveMap<
    string,
    CanvasObject
  >;

  const syncShapeInStorage = useMutation(
    ({ storage }, object: fabric.Object) => {
      if (!object) return;

      const { objectId } = object;
      const shapeData = object.toJSON();
      shapeData.objectId = objectId;

      const canvasObjects = storage.get("canvasObjects") as LiveMap<
        string,
        any
      >;
      if (canvasObjects) {
        canvasObjects.set(objectId, shapeData);
      } else {
        console.error(
          "canvasObjects is not a LiveMap or doesn't have a set method"
        );
      }
    },
    []
  );

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

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    if (canvas && userRole.access === "ROLE_READ") {
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
      return;
    } else if (canvas) {
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

      canvas.on("mouse:wheel", (options) => {
        handleCanvasZoom({
          canvas,
          options,
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
  }, [canvasRef, userRole]);

  useEffect(() => {
    if (canvasObjects) {
      renderCanvas({ fabricRef, activeObjectRef, canvasObjects });
    }
  }, [canvasObjects]);

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
        <Live
          canvasRef={canvasRef}
          role={userRole.access}
          undo={undo}
          redo={redo}
        />
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
