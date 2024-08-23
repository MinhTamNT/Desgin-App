import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import { Live } from "../../components/Live/Live";
import Room from "../../components/Room/Room";
import NavbarProject from "../../layout/Project/NavbarProject";
import LeftSidebar from "../../layout/Project/LeftSidebar";
import RightSidebar from "../../layout/Project/RightSidebar";
import {
  handleCanvasMouseDown,
  handleResize,
  initializeFabric,
} from "../../lib/cavans";
import { ActiveElement } from "../../type/type";
import { useParams } from "react-router-dom";

export const Project = () => {
  const { idProject } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: "",
    value: "",
    icon: "",
  });

  const handleActiveElement = (element: ActiveElement) => {
    setActiveElement(element);
    selectedShapeRef.current = element?.value as string;
  };

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });

    if (canvas) {
      console.log("cc");
      canvas.on("mouse:down", (options) => {
        handleCanvasMouseDown({
          options,
          canvas,
          selectedShapeRef,
          isDrawing,
          shapeRef,
        });
      });

      const handleResizeEvent = () => {
        handleResize({ canvas: fabricRef.current });
      };

      window.addEventListener("resize", handleResizeEvent);

      return () => {
        window.removeEventListener("resize", handleResizeEvent);
      };
    } else {
      console.log("Canvas not initialized");
    }
  }, [canvasRef]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <Room idRoom={idProject ?? ""}>
      <main className="h-screen overflow-hidden">
        <NavbarProject
          activeElement={activeElement}
          handleActiveElement={handleActiveElement}
          handleImageUpload={handleImageUpload}
          imageInputRef={imageInputRef}
        />
        <section className="flex h-full flex-row">
          <LeftSidebar />
          <Live canvasRef={canvasRef} />
          <RightSidebar />
        </section>
      </main>
    </Room>
  );
};
