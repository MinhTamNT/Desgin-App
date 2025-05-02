import { LiveMap } from "@liveblocks/client";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { fabric } from "fabric";
import "reactflow/dist/style.css";
declare module "fabric" {
  namespace fabric {
    interface Image {
      hasUploaded?: boolean;
    }
  }
}
import { useEffect, useRef, useState } from "react";
import { Live } from "../../components/Live/Live";
import { uploadImageToCloudinary } from "../../helper/UpdateImage";
import NavbarProject from "../../layout/Project/NavbarProject";
import ImageSearchModal from "../../components/ImageSearch/ImageSearchModal";
import ScreenshotSelector from "../../components/ScreenshotSelector/ScreenshotSelector";
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
import {
  exportCanvasToJSON,
  downloadJSON,
  importCanvasFromJSON,
  readFileAsText,
} from "../../lib/exportImport";
import { ActiveElement, Attributes } from "../../type/type";
import { defaultNavElement } from "../../utils";
import { handleDelete, handleKeyDown } from "../../utils/Key/key-event";
import { RootState } from "../../Redux/store";
import { useSelector } from "react-redux";
import { NOTIFICATION_SUBSCRIPTION } from "../../utils/Notify/Notify";
import { useSubscription } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CanvasObject } from "../../lib/interface";
import { useOthers } from "@liveblocks/react/suspense";
import "../../index.css";
import LeftSidebar from "../../layout/Project/LeftSidebar";
import Loading from "../../components/Loading/Loading";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { CHECK_PROJECT } from "../../utils/Project/Project";
interface UserRequest {
  idUser: string;
}

export const Project = () => {
  const undo = useUndo();
  const redo = useRedo();
  const { idProject } = useParams();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>(null);
  const [, setNotifications] = useState<string[]>([]);
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

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScreenshotSelectorOpen, setIsScreenshotSelectorOpen] =
    useState(false);
  const [screenshotImage, setScreenshotImage] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: projectData,
    loading: loadingProjectData,
    error: errorProjectData,
  } = useQuery(CHECK_PROJECT, {
    variables: { projectId: idProject ?? "" },
  });
  console.log(projectData);
  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const userRole = useSelector(
    (state: RootState) => state?.role?.role?.userRole
  );

  useEffect(() => {
    if (loadingProjectData) return;
    if (errorProjectData) {
      console.log(errorProjectData);
    }
    console.log(projectData);
    if (projectData?.checkProject?.RetCode < 0) {
      navigate(`/permision/${idProject}`);
    }
  }, [loadingProjectData, errorProjectData, projectData]);

  const other = useOthers();
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
    const file = event.target.files ? event.target.files[0] : null;
    try {
      if (!file || !(file instanceof File)) {
        console.warn("No file selected or file is not a File object");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const newImage = await uploadImageToCloudinary(
            event.target.result as string
          );
          if (newImage) {
            handleImageUpload({
              file: newImage.secure_url,
              canvas: fabricRef.current as any,
              shapeRef,
              syncShapeInStorage,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading the image:", error);
    }
  };
  const canvasObjects = useStorage((root) => root.canvasObjects) as LiveMap<
    string,
    CanvasObject
  >;
  console.log(other);

  const syncShapeInStorage = useMutation(
    ({ storage }, object: fabric.Object) => {
      if (!object) return;

      const objectId = (object as any).objectId;
      const shapeData = { ...object.toJSON(), objectId };

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

  const handleExportDesign = () => {
    setIsLoading(true);

    try {
      if (isLoading) {
        <Loading />;
      }

      setTimeout(() => {
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const fileName = `design-export-${timestamp}.json`;

          const jsonData = exportCanvasToJSON(fabricRef.current, canvasObjects);
          downloadJSON(jsonData, fileName);

          toast.success("Design exported successfully!");
        } catch (error) {
          console.error("Error exporting design:", error);
          toast.error("Failed to export design");
        } finally {
          setIsLoading(false);
        }
      }, 500); // Small delay to allow UI update
    } catch (error) {
      console.error("Error in export process:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleImportDesign = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create a modal for user to choose import mode
      const importModal = document.createElement("div");
      importModal.className =
        "absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
      importModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg flex flex-col items-center max-w-md">
          <h3 class="text-xl font-bold mb-4">Chọn chế độ nhập</h3>
          <p class="text-gray-700 mb-4">Bạn muốn thay thế thiết kế hiện tại hoặc thêm thiết kế mới vào thiết kế đang có?</p>
          <div class="flex gap-4">
            <button id="replace-design" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Thay thế
            </button>
            <button id="merge-design" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Thêm vào
            </button>
            <button id="cancel-import" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
              Hủy
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(importModal);

      const jsonContent = await readFileAsText(file);

      const handleImportAction = async (replaceExisting: boolean) => {
        document.body.removeChild(importModal);

        const loadingOverlay = document.createElement("div");
        loadingOverlay.className =
          "absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
        loadingOverlay.innerHTML = `
          <div class="bg-white p-5 rounded-lg flex flex-col items-center">
            <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500 mb-3"></div>
            <div class="text-white">Đang nhập thiết kế...</div>
          </div>
        `;
        document.body.appendChild(loadingOverlay);

        try {
          const success = await importCanvasFromJSON(
            jsonContent,
            fabricRef,
            syncShapeInStorage,
            deleteAllShapes,
            replaceExisting
          );

          if (success) {
            toast.success(
              replaceExisting
                ? "Thiết kế đã được nhập và thay thế thiết kế cũ!"
                : "Thiết kế đã được nhập và thêm vào thiết kế hiện tại!"
            );
          } else {
            toast.error("Không thể nhập thiết kế. Vui lòng kiểm tra lại file.");
          }
        } catch (error) {
          console.error("Error importing design:", error);
          toast.error(
            "Lỗi khi nhập thiết kế. File có thể bị hỏng hoặc không hợp lệ."
          );
        } finally {
          document.body.removeChild(loadingOverlay);
        }
      };

      document
        .getElementById("replace-design")
        ?.addEventListener("click", () => handleImportAction(true));
      document
        .getElementById("merge-design")
        ?.addEventListener("click", () => handleImportAction(false));
      document
        .getElementById("cancel-import")
        ?.addEventListener("click", () => {
          document.body.removeChild(importModal);
          toast.info("Đã hủy nhập thiết kế");
        });

      event.target.value = "";
    } catch (error) {
      console.error("Error reading import file:", error);
      toast.error("Lỗi khi đọc file. Vui lòng thử lại với file khác.");
      event.target.value = "";
    }
  };

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    if (!canvas) {
      console.error("Canvas not initialized");
      return;
    }

    if (userRole?.role === "ROLE_READ") {
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
      return;
    }

    canvas.on("mouse:down", (options) => {
      if (!options) {
        console.error("Mouse down options are undefined");
        return;
      }
      handleCanvasMouseDown({
        options,
        canvas,
        selectedShapeRef,
        isDrawing,
        shapeRef,
      });
    });

    canvas.on("mouse:move", (options) => {
      if (!options) {
        console.error("Mouse move options are undefined");
        return;
      }
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
      if (!options) {
        console.error("Mouse up options are undefined");
        return;
      }
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
    const handlePaste = async (e: ClipboardEvent) => {
      e.preventDefault();
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image")) {
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            if (!event.target?.result) return;

            fabric.Image.fromURL(event.target.result as string, async (img) => {
              if (!img) return;

              img.scaleToWidth(200);
              img.set({
                left: 100,
                top: 100,
                selectable: true,
                hasUploaded: false,
              });

              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();

              const loadingOverlay = document.createElement("div");
              loadingOverlay.className =
                "absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50";
              loadingOverlay.innerHTML = `
                <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-white"></div>
              `;
              document.body.appendChild(loadingOverlay);

              try {
                const newImage = await uploadImageToCloudinary(file as any);
                if (newImage) {
                  handleImageUpload({
                    file: newImage.secure_url,
                    canvas: fabricRef.current as any,
                    shapeRef,
                    syncShapeInStorage,
                  });

                  img.setSrc(newImage.secure_url, () => {
                    img.hasUploaded = true;
                    canvas.renderAll();
                  });
                }
              } catch (error) {
                console.error("Error uploading image:", error);
              } finally {
                document.body.removeChild(loadingOverlay);
              }
            });
          };
          reader.readAsDataURL(file);
        }
      }
    };

    window.addEventListener("paste", handlePaste);
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
      window.removeEventListener("paste", handlePaste);
    };
  }, [canvasRef, userRole]);

  // Handle screenshot captured from the selection tool
  const handleScreenshotCaptured = (imageData: string) => {
    setScreenshotImage(imageData);
    setIsScreenshotSelectorOpen(false);
    setIsSearchModalOpen(true);
  };

  useEffect(() => {
    if (canvasObjects) {
      renderCanvas({ fabricRef, activeObjectRef, canvasObjects });
    }
  }, [canvasObjects]);

  const handleAddSearchResultToCanvas = (imageUrl: string) => {
    const event = new CustomEvent("addImageToCanvas", {
      detail: { imagePath: imageUrl },
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleAddImageToCanvas = async (event: CustomEvent) => {
      const { imagePath } = event.detail;
      setIsLoading(true);
      fabric.Image.fromURL(imagePath, async (img) => {
        if (img) {
          img.scaleToWidth(200);
          img.set({
            left: 300,
            top: 300,
            selectable: true,
          });

          const canvas = fabricRef.current;
          if (canvas) {
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          }

          if (isLoading) {
            <Loading />;
            setIsLoading(false);
          }

          try {
            const response = await fetch(imagePath);
            const blob = await response.blob();
            const base64Data = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });

            const cloudinaryData = await uploadImageToCloudinary(base64Data);
            console.log(cloudinaryData?.secure_url);
            if (cloudinaryData?.secure_url) {
              img.setSrc(cloudinaryData.secure_url, () => {
                canvas?.renderAll();
              });
              handleImageUpload({
                file: cloudinaryData.secure_url,
                canvas: fabricRef.current as any,
                shapeRef,
                syncShapeInStorage,
              });
            }
          } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
          } finally {
            if (isLoading) {
              setIsLoading(false);
            }
          }
        }
      });
    };

    const eventListener = handleAddImageToCanvas as unknown as EventListener;
    window.addEventListener("addImageToCanvas", eventListener);

    return () => {
      window.removeEventListener("addImageToCanvas", eventListener);
    };
  }, [fabricRef]);

  return (
    <main className="h-screen overflow-hidden">
      <NavbarProject
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
        handleImageUpload={handleImageUploads}
        imageInputRef={imageInputRef}
      />
      <section className="flex h-full flex-row">
        <LeftSidebar allShape={Array.from(canvasObjects ?? [])} />
        <Live
          canvasRef={canvasRef}
          role={userRole?.role}
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
          handleExportDesign={handleExportDesign}
          handleImportDesign={handleImportDesign}
        />
      </section>

      <ImageSearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchImage={screenshotImage}
        onSelectImage={handleAddSearchResultToCanvas}
      />

      {isScreenshotSelectorOpen && (
        <ScreenshotSelector
          onClose={() => setIsScreenshotSelectorOpen(false)}
          onCapture={handleScreenshotCaptured}
          canvasRef={canvasRef}
        />
      )}
    </main>
  );
};
