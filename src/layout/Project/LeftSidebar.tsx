import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaShapes,
  FaImage,
  FaFont,
  FaSquare,
  FaCircle,
  FaStar,
  FaRegStar,
  FaLock,
  FaUnlock,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaChevronRight,
  FaLayerGroup,
  FaPlay,
  FaPencilAlt,
  FaQuestionCircle,
  FaTimes,
  FaComment,
  FaSmile,
  FaCopy,
  FaPaste,
  FaUndo,
} from "react-icons/fa";

type Shape = {
  objectId: string;
  type: string;
  width?: number;
  height?: number;
  text?: string;
  locked?: boolean;
  visible?: boolean;
};

type LeftSidebarProps = {
  allShape: Array<[string, Shape]>;
  handleLock: () => void;
  handleUnlock: () => void;
  handleShow: () => void;
  handleHide: () => void;
};

interface GuideItem {
  title: string;
  description: string;
  shortcut?: string;
  icon?: React.ReactNode;
}

const guideItems: GuideItem[] = [
  {
    title: "Mở chat",
    description: "Nhấn phím / để mở cửa sổ chat",
    shortcut: "/",
    icon: <FaComment className="text-blue-400" />,
  },
  {
    title: "Thêm reaction",
    description: "Nhấn phím E để thêm reaction",
    shortcut: "E",
    icon: <FaSmile className="text-yellow-400" />,
  },
  {
    title: "Copy đối tượng",
    description: "Nhấn Ctrl + C để sao chép đối tượng",
    shortcut: "Ctrl + C",
    icon: <FaCopy className="text-green-400" />,
  },
  {
    title: "Paste đối tượng",
    description: "Nhấn Ctrl + V để dán đối tượng",
    shortcut: "Ctrl + V",
    icon: <FaPaste className="text-purple-400" />,
  },
  {
    title: "Hoàn tác",
    description: "Nhấn Ctrl + Z để hoàn tác thao tác",
    shortcut: "Ctrl + Z",
    icon: <FaUndo className="text-red-400" />,
  },
];

export default function LeftSidebar({
  allShape,
  handleLock,
  handleUnlock,
  handleShow,
  handleHide,
}: LeftSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({
    shapes: true,
    text: true,
    images: true,
  });

  const [showGuide, setShowGuide] = useState(false);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const getShapeIcon = (type: string) => {
    switch (type) {
      case "rect":
        return <FaSquare className="text-blue-400" size={14} />;
      case "circle":
        return <FaCircle className="text-purple-400" size={14} />;
      case "star":
        return <FaStar className="text-yellow-400" size={14} />;
      case "polygon":
        return <FaRegStar className="text-green-400" size={14} />;
      case "triangle":
        return (
          <FaPlay
            className="text-orange-400"
            size={14}
            style={{ transform: "rotate(90deg)" }}
          />
        );
      case "drawing":
        return <FaPencilAlt className="text-red-400" size={14} />;
      case "textbox":
        return <FaFont className="text-indigo-400" size={14} />;
      case "image":
        return <FaImage className="text-pink-400" size={14} />;
      default:
        return <FaShapes className="text-gray-400" size={14} />;
    }
  };

  const renderShapeItem = (id: string, shape: Shape) => (
    <div
      key={id}
      className="bg-[#2a2a2a] rounded-lg p-3 border border-[#3a3a3a]/30 hover:border-[#4a4a4a]/50 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
            {getShapeIcon(shape.type)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
            </p>
            <p className="text-xs text-gray-400">
              {shape.type === "text"
                ? shape.text?.slice(0, 20) + "..."
                : shape.type === "image"
                ? "Image"
                : `${Math.round(shape.width || 0)}x${Math.round(
                    shape.height || 0
                  )}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Lock/Unlock"
            onClick={() => (shape.locked ? handleUnlock() : handleLock())}
          >
            {shape.locked ? <FaLock size={12} /> : <FaUnlock size={12} />}
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Show/Hide"
            onClick={() => (shape.visible ? handleHide() : handleShow())}
          >
            {shape.visible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGroup = (
    title: string,
    type: string,
    shapes: Array<[string, Shape]>
  ) => (
    <div className="mb-4">
      <button
        onClick={() => toggleGroup(type)}
        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center">
          <span className="text-sm font-medium text-white">{title}</span>
          <span className="ml-2 text-xs text-gray-400">({shapes.length})</span>
        </div>
        {expandedGroups[type] ? (
          <FaChevronDown size={12} />
        ) : (
          <FaChevronRight size={12} />
        )}
      </button>

      {expandedGroups[type] && (
        <div className="mt-2 space-y-2 pl-2">
          {shapes.map(([id, shape]) => renderShapeItem(id, shape))}
        </div>
      )}
    </div>
  );

  const handleGuideClick = () => {
    setShowGuide(true);
  };

  const renderGuide = () => {
    return createPortal(
      <div className="fixed z-[9999] inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-[#2a2a2a] rounded-lg w-[800px] max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-[#2a2a2a] p-4 border-b border-[#3a3a3a]/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FaQuestionCircle className="mr-2 text-blue-400" />
              Hướng dẫn sử dụng
            </h3>
            <button
              onClick={() => setShowGuide(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {guideItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#333333] rounded-lg p-4 border border-[#3a3a3a]/30 hover:border-[#4a4a4a]/50 transition-all"
                >
                  <div className="flex items-start space-x-3">
                    {item.icon && (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-medium truncate">
                          {item.title}
                        </h4>
                        {item.shortcut && (
                          <span className="bg-[#4a4a4a] text-gray-300 px-2 py-1 rounded text-sm ml-2 flex-shrink-0">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <section className="h-full w-[280px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-lg border-r border-[#3a3a3a]/30">
        {/* Header */}
        <div className="sticky top-0 bg-[#2a2a2a] z-10 px-4 py-4 border-b border-[#3a3a3a]/50">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-wide flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mr-3">
                <FaLayerGroup className="text-white" size={16} />
              </div>
              <p className="text-sm font-bold tracking-wide text-white">
                Design Elements
              </p>
            </h3>
            <button
              onClick={handleGuideClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Hướng dẫn sử dụng"
            >
              <FaQuestionCircle
                className="text-gray-400 hover:text-white"
                size={16}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-11">
            {allShape.length} elements in design
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {renderGroup(
            "Shapes",
            "shapes",
            allShape.filter(([, shape]) =>
              [
                "rect",
                "circle",
                "star",
                "polygon",
                "line",
                "arrow",
                "triangle",
                "path",
              ].includes(shape.type)
            )
          )}

          {renderGroup(
            "Text Elements",
            "text",
            allShape.filter(([, shape]) => shape.type === "textbox")
          )}

          {renderGroup(
            "Images",
            "images",
            allShape.filter(([, shape]) => shape.type === "image")
          )}

          <div className="mt-6 p-4 bg-[#333333] rounded-lg border border-[#3a3a3a]/30">
            <button
              onClick={handleGuideClick}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-200"
            >
              <FaQuestionCircle size={16} />
              <span>Hướng dẫn sử dụng</span>
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Nhấn vào đây để xem hướng dẫn chi tiết về cách sử dụng công cụ
            </p>
          </div>
        </div>
      </section>
      {showGuide && renderGuide()}
    </>
  );
}
