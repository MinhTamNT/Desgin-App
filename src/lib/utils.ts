import jsPDF from "jspdf";
import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import Rectangle from "../assets/rectangle.svg";
import Circle from "../assets/circle.svg";
import Triangle from "../assets/triangle.svg";
import Line from "../assets/line.svg";
import Image from "../assets/image.svg";
import Freeform from "../assets/freeform.svg";
import Select from "../assets/select.svg";
import Text from "../assets/text.svg";
import Delete from "../assets/delete.svg";
import Reset from "../assets/reset.svg";
import Comments from "../assets/comments.svg";
import Front from "../assets/front.svg";
import Back from "../assets/back.svg";
import AlignLeft from "../assets/align-left.svg";
import AlignHorizontalCenter from "../assets/align-horizontal-center.svg";
import AlignRight from "../assets/align-right.svg";
import AlignTop from "../assets/align-top.svg";
import AlignVerticalCenter from "../assets/align-vertical-center.svg";
import AlignBottom from "../assets/align-bottom.svg";
const adjectives = [
  "Happy",
  "Creative",
  "Energetic",
  "Lively",
  "Dynamic",
  "Radiant",
  "Joyful",
  "Vibrant",
  "Cheerful",
  "Sunny",
  "Sparkling",
  "Bright",
  "Shining",
];

const animals = [
  "Dolphin",
  "Tiger",
  "Elephant",
  "Penguin",
  "Kangaroo",
  "Panther",
  "Lion",
  "Cheetah",
  "Giraffe",
  "Hippopotamus",
  "Monkey",
  "Panda",
  "Crocodile",
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomName(): string {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];

  return `${randomAdjective} ${randomAnimal}`;
}

export const getShapeInfo = (shapeType: string) => {
  switch (shapeType) {
    case "rect":
      return {
        icon: Rectangle,
        name: "Rectangle",
      };

    case "circle":
      return {
        icon: Circle,
        name: "Circle",
      };

    case "triangle":
      return {
        icon: Triangle,
        name: "Triangle",
      };

    case "line":
      return {
        icon: Line,
        name: "Line",
      };

    case "i-text":
      return {
        icon: Text,
        name: "Text",
      };

    case "image":
      return {
        icon: Image,
        name: "Image",
      };

    case "freeform":
      return {
        icon: "../assets/freeform.svg",
        name: "Free Drawing",
      };

    default:
      return {
        icon: "../assets/rectangle.svg",
        name: shapeType,
      };
  }
};

export const exportToPdf = () => {
  const canvas = document.querySelector("canvas");

  if (!canvas) return;

  // use jspdf
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  // get the canvas data url
  const data = canvas.toDataURL();

  // add the image to the pdf
  doc.addImage(data, "PNG", 0, 0, canvas.width, canvas.height);

  // download the pdf
  doc.save("canvas.pdf");
};
