import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Color from "../../components/Color/Color";
import { Dimensions } from "../../components/Dimensions/Dimensions";
import Text from "../../components/Text/Text";
import { modifyShape } from "../../lib/shape";
import { RightSidebarProps } from "../../type/type";
import { fabric } from "fabric";
import { RootState } from "../../Redux/store";
import SearchImageModal from "../../components/SearchImage/SearchImage";
import {
  FaFileExport,
  FaFileImport,
  FaImage,
  FaSlidersH,
  FaSearch,
  FaRegEye,
} from "react-icons/fa";

export default function RightSidebar({
  activeObjectRef,
  elementAttributes,
  fabricRef,
  isEditingRef,
  setElementAttributes,
  syncShapeInStorage,
  handleExportDesign,
  handleImportDesign,
}: RightSidebarProps) {
  const role = useSelector((state: RootState) => state?.role?.role?.userRole);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "content" | "importExport" | "searchImages"
  >("content");
  const handleCloseModal = () => setIsModalOpen(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (property: string, value: string) => {
    if (!fabricRef.current) isEditingRef.current = true;

    setElementAttributes((prev) => ({ ...prev, [property]: value }));

    if (role === "ROLE_WRITE") {
      modifyShape({
        canvas: fabricRef.current as fabric.Canvas,
        property,
        value,
        activeObjectRef,
        syncShapeInStorage,
      });
    } else {
      modifyShape({
        canvas: fabricRef.current as fabric.Canvas,
        property,
        value,
        activeObjectRef,
        syncShapeInStorage: () => {},
      });
    }
  };

  const triggerImportInput = () => {
    if (importInputRef.current) {
      importInputRef.current.click();
    }
  };

  // Tab styles
  const tabBaseStyle =
    "flex-1 py-3 text-center text-sm font-medium transition-all duration-200";
  const activeTabStyle = `${tabBaseStyle} text-white border-b-2 border-white`;
  const inactiveTabStyle = `${tabBaseStyle} text-gray-400 hover:text-gray-200 border-b-2 border-transparent hover:border-gray-700`;

  const renderContentTab = () => (
    <>
      <div className="px-4 py-3 border-b border-[#3a3a3a]/50">
        <div className="flex items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
              clipRule="evenodd"
            />
          </svg>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Dimensions
          </h4>
        </div>
        <Dimensions
          width={elementAttributes.width}
          height={elementAttributes.height}
          handleInputChange={handleInputChange}
          isEditingRef={isEditingRef}
        />
      </div>

      <div className="px-4 py-3 border-b border-[#3a3a3a]/50">
        <div className="flex items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M13.293 3.293A1 1 0 0114 4v7h2a1 1 0 110 2h-2v2a3 3 0 01-3 3H5a3 3 0 01-3-3v-4a3 3 0 013-3h2V4a1 1 0 011.707-.707l2 2a1 1 0 010 1.414l-2 2A1 1 0 015 8V6H5a1 1 0 00-1 1v4a1 1 0 001 1h6a1 1 0 001-1v-2h-2a1 1 0 110-2h2V5.414l-1.293-1.293z"
              clipRule="evenodd"
            />
          </svg>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Typography
          </h4>
        </div>
        <Text
          fontFamily={elementAttributes.fontFamily}
          fontSize={elementAttributes.fontSize}
          fontWeight={elementAttributes.fontWeight}
          textColor={
            (elementAttributes as any).textColor || elementAttributes.fill
          }
          textAlign={elementAttributes.textAlign}
          backgroundColor={elementAttributes.backgroundColor as any}
          handleInputChange={handleInputChange}
        />
      </div>

      <div className="px-4 py-3 border-b border-[#3a3a3a]/50">
        <div className="flex items-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
              clipRule="evenodd"
            />
          </svg>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Fill Color
          </h4>
        </div>
        <Color
          inputRef={activeObjectRef}
          attribute={elementAttributes.fill}
          placeholder="Fill Color"
          attributeType="fill"
          handleInputChange={handleInputChange}
        />
      </div>
    </>
  );

  const renderImportExportTab = () => (
    <div className="px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-3">
            <FaFileExport className="text-white" size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Export Design</h4>
            <p className="text-xs text-gray-400">
              Save your design in different formats
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleExportDesign}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg p-3 transition-all flex items-center justify-between font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98] group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center mr-3">
                <FaFileExport className="text-white" size={14} />
              </div>
              <span>Export as JSON</span>
            </div>
            <span className="text-xs bg-white/10 px-2 py-1 rounded">
              Editable
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (fabricRef.current) {
                  const dataURL = fabricRef.current.toDataURL({
                    format: "png",
                    quality: 1,
                  });
                  const link = document.createElement("a");
                  link.download = "design.png";
                  link.href = dataURL;
                  link.click();
                }
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg p-3 transition-all flex flex-col items-center justify-center font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <FaImage className="text-white" size={18} />
              </div>
              <span>PNG</span>
              <span className="text-xs text-white/70 mt-1">High Quality</span>
            </button>

            <button
              onClick={() => {
                if (fabricRef.current) {
                  const dataURL = fabricRef.current.toDataURL({
                    format: "jpeg",
                    quality: 0.9,
                  });
                  const link = document.createElement("a");
                  link.download = "design.jpg";
                  link.href = dataURL;
                  link.click();
                }
              }}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg p-3 transition-all flex flex-col items-center justify-center font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <FaImage className="text-white" size={18} />
              </div>
              <span>JPG</span>
              <span className="text-xs text-white/70 mt-1">Web Optimized</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (fabricRef.current) {
                const dataURL = fabricRef.current.toDataURL({
                  format: "png",
                  quality: 1,
                });
                const previewWindow = window.open("", "_blank");
                if (previewWindow) {
                  previewWindow.document.write(`
                    <html>
                      <head>
                        <title>Design Preview</title>
                        <style>
                          body { 
                            margin: 0; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh;
                            background: #f0f0f0;
                          }
                          img { 
                            max-width: 100%; 
                            max-height: 100vh;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                          }
                        </style>
                      </head>
                      <body>
                        <img src="${dataURL}" alt="Design Preview" />
                      </body>
                    </html>
                  `);
                  previewWindow.document.close();
                }
              }
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg p-3 transition-all flex items-center justify-between font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center mr-3">
                <FaRegEye className="text-white" size={14} />
              </div>
              <span>Preview Design</span>
            </div>
            <span className="text-xs bg-white/10 px-2 py-1 rounded">
              New Window
            </span>
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-[#3a3a3a]/50">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3">
            <FaFileImport className="text-white" size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Import Design</h4>
            <p className="text-xs text-gray-400">
              Continue working on a saved design
            </p>
          </div>
        </div>

        <button
          onClick={triggerImportInput}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg p-3 transition-all flex items-center justify-between font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center mr-3">
              <FaFileImport className="text-white" size={14} />
            </div>
            <span>Import Design</span>
          </div>
          <span className="text-xs bg-white/10 px-2 py-1 rounded">JSON</span>
        </button>

        <input
          type="file"
          ref={importInputRef}
          style={{ display: "none" }}
          accept=".json"
          onChange={handleImportDesign}
        />
      </div>
    </div>
  );

  const renderSearchImagesTab = () => (
    <div className="px-4 py-6">
      <h4 className="text-sm font-semibold mb-3 text-white">Search Images</h4>
      <p className="text-xs text-gray-400 mb-4">
        Find and add images to enhance your design
      </p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-md p-3 transition-all flex items-center justify-center font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        <FaSearch size={18} className="mr-2" />
        Search Images Library
      </button>

      <div className="mt-6 p-4 bg-[#222222] rounded-md border border-[#3a3a3a]/50">
        <p className="text-xs text-gray-300 mb-2">
          <span className="font-semibold">Tip:</span> You can search for images
          by keywords and categories
        </p>
        <p className="text-xs text-gray-400">
          Images will be added directly to your canvas and can be resized and
          positioned as needed.
        </p>
      </div>
    </div>
  );

  return (
    <section className="h-full w-[280px] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-lg border-l border-[#3a3a3a]/30">
      {/* Header */}
      <div className="sticky top-0 bg-[#2a2a2a] z-10 px-4 py-4 border-b border-[#3a3a3a]/50">
        <h3 className="text-sm font-bold tracking-wide flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
            <FaSlidersH className="text-white" size={16} />
          </div>
          <p className="text-sm font-bold tracking-wide text-white">
            Design Properties
          </p>
        </h3>
        <p className="text-xs text-gray-400 mt-1 ml-11">
          Customize your selected element
        </p>
      </div>

      <div className="sticky top-[85px] bg-[#222] z-10 flex border-b border-[#3a3a3a]">
        <button
          className={
            activeTab === "content" ? activeTabStyle : inactiveTabStyle
          }
          onClick={() => setActiveTab("content")}
        >
          <div className="flex items-center justify-center">
            <FaSlidersH className="mr-1.5" size={12} />
            <span>Content</span>
          </div>
        </button>
        <button
          className={
            activeTab === "importExport" ? activeTabStyle : inactiveTabStyle
          }
          onClick={() => setActiveTab("importExport")}
        >
          <div className="flex items-center justify-center">
            <FaFileExport className="mr-1.5" size={12} />
            <span>Import/Export</span>
          </div>
        </button>
        <button
          className={
            activeTab === "searchImages" ? activeTabStyle : inactiveTabStyle
          }
          onClick={() => setActiveTab("searchImages")}
        >
          <div className="flex items-center justify-center">
            <FaImage className="mr-1.5" size={12} />
            <span>Images</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 mr-[-10px] overflow-y-auto">
        {activeTab === "content" && renderContentTab()}
        {activeTab === "importExport" && renderImportExportTab()}
        {activeTab === "searchImages" && renderSearchImagesTab()}
      </div>

      {isModalOpen && <SearchImageModal onClose={handleCloseModal} />}
    </section>
  );
}
