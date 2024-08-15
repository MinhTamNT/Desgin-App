import { fabric } from "fabric";
import { useEffect, useRef } from "react";
import { Live } from "../../components/Live/Live";
import Room from "../../components/Room/Room";
import NavbarProject from "../../layout/Project/NavbarProject";
export const Project = () => {
  const canvanRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvanRef.current);
    const test = new fabric.Rect({
      left: 0,
      top: 0,
      fill: "red",
      width: 200,
      height: 200,
    });
    canvas.add(test);
    return () => {
      canvas.dispose();
    };
  }, []);
  return (
    <Room>
      <main className="h-screen overflow-hidden">
        <NavbarProject activeElement={""} />
        <section className="flex h-full flex-row">
          <Live />
        </section>
      </main>
    </Room>
  );
};
