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
export const shapeElements = [
  {
    icon: Rectangle,
    name: "Rectangle",
    value: "rectangle",
  },
  {
    icon: Circle,
    name: "Circle",
    value: "circle",
  },
  {
    icon: Triangle,
    name: "Triangle",
    value: "triangle",
  },
  {
    icon: Line,
    name: "Line",
    value: "line",
  },
  {
    icon: Image,
    name: "Image",
    value: "image",
  },
  {
    icon: Freeform,
    name: "Free Drawing",
    value: "freeform",
  },
];

export const navElements = [
  {
    icon: Select,
    name: "Select",
    value: "select",
  },
  {
    icon: Rectangle,
    name: "Rectangle",
    value: shapeElements,
  },
  {
    icon: Text,
    name: "Text",
    value: "text",
  },
  {
    icon: Delete,
    name: "Delete",
    value: "delete",
  },
  {
    icon: Reset,
    name: "Reset",
    value: "reset",
  },
  {
    icon: Comments,
    name: "Comments",
    value: "comments",
  },
];

export const defaultNavElement = {
  icon: Select,
  name: "Select",
  value: "select",
};

export const directionOptions = [
  { label: "Bring to Front", value: "front", icon: Front },
  { label: "Send to Back", value: "back", icon: Back },
];

export const alignmentOptions = [
  { value: "left", label: "Align Left", icon: AlignLeft },
  {
    value: "horizontalCenter",
    label: "Align Horizontal Center",
    icon: AlignHorizontalCenter,
  },
  { value: "right", label: "Align Right", icon: AlignRight },
  { value: "top", label: "Align Top", icon: AlignTop },
  {
    value: "verticalCenter",
    label: "Align Vertical Center",
    icon: AlignVerticalCenter,
  },
  { value: "bottom", label: "Align Bottom", icon: AlignBottom },
];
