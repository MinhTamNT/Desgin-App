import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import Room from "../../components/Room/Room";
import { Live } from "../../components/Live/Live";
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
      <div>
        <Live />
      </div>
    </Room>
  );
};
