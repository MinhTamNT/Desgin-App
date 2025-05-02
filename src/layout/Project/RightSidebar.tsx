import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Color from "../../components/Color/Color";
import { Dimensions } from "../../components/Dimensions/Dimensions";
import Text from "../../components/Text/Text";
import { modifyShape } from "../../lib/shape";
import { RightSidebarProps } from "../../type/type";
import { fabric } from "fabric";
import { RootState } from "../../Redux/store";
import SearchImageModal from "../../components/SearchImage/SearchImage";

export default function RightSidebar({
  activeObjectRef,
  elementAttributes,
  fabricRef,
  isEditingRef,
  setElementAttributes,
  syncShapeInStorage,
}: RightSidebarProps) {
  const role = useSelector((state: RootState) => state?.role?.role?.userRole);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => setIsModalOpen(false);
  
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

  return (
    <section className="flex flex-col text-white rounded-lg mt-1 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] shadow-lg border border-[#3a3a3a]/30 min-w-[250px] max-w-xs sm:max-w-[300px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-[#2a2a2a] z-10 px-4 py-3 border-b border-[#3a3a3a]/50">
        <h3 className="text-sm font-bold tracking-wide flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Design Properties
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Customize your selected element
        </p>
      </div>

      {/* Search Images Button */}
      <div className="px-4 py-3 border-b border-[#3a3a3a]/50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-md p-2.5 transition-all flex items-center justify-center font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Search Images
        </button>
      </div>

      {/* Dimensions Section */}
      <div className="px-4 py-3 border-b border-[#3a3a3a]/50">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dimensions</h4>
        </div>
        <Dimensions
          width={elementAttributes.width}
          height={elementAttributes.height}
          handleInputChange={handleInputChange}
          isEditingRef={isEditingRef}
        />
      </div>

      {/* Text Section */}
      <div className="px-4 py-3 border-b border-[#3a3a3a]/50">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M13.293 3.293A1 1 0 0114 4v7h2a1 1 0 110 2h-2v2a3 3 0 01-3 3H5a3 3 0 01-3-3v-4a3 3 0 013-3h2V4a1 1 0 011.707-.707l2 2a1 1 0 010 1.414l-2 2A1 1 0 015 8V6H5a1 1 0 00-1 1v4a1 1 0 001 1h6a1 1 0 001-1v-2h-2a1 1 0 110-2h2V5.414l-1.293-1.293z" clipRule="evenodd" />
          </svg>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Typography</h4>
        </div>
        <Text
          fontFamily={elementAttributes.fontFamily}
          fontSize={elementAttributes.fontSize}
          fontWeight={elementAttributes.fontWeight}
          handleInputChange={handleInputChange}
        />
      </div>
      {/* Color Section */}
      <div className="px-4 py-3">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
          </svg>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Color</h4>
        </div>
        <Color
          inputRef={activeObjectRef}
          attribute={elementAttributes.fill}
          placeholder="Color"
          attributeType="fill"
          handleInputChange={handleInputChange}
        />
      </div>

      {/* Search Image Modal */}
      {isModalOpen && <SearchImageModal onClose={handleCloseModal} />}
    </section>
  );
}
