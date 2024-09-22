import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import Color from "../../components/Color/Color";
import { Dimensions } from "../../components/Dimensions/Dimensions";
import Text from "../../components/Text/Text";
import { modifyShape } from "../../lib/shape";
import { RightSidebarProps } from "../../type/type";
import { fabric } from "fabric";
import { RootState } from "../../Redux/store";
import SearchModal from "../../components/SearchImage/SearchImage";

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
    <section className="flex flex-col text-white rounded-md mt-1 bg-gradient-to-br from-[#3a3a3a] via-[#2b2b2b] to-[#1a1a1a] shadow-lg shadow-orange-50 min-w-[227px] max-w-xs sm:max-w-[300px] sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
      <h3 className="px-5 pt-4 text-xs font-bold uppercase tracking-wide">
        Design
      </h3>
      <span className="text-xs text-white mt-3 px-5 py-2 border-b border-primary-grey-300">
        Make changes to canvas as you like
      </span>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white rounded p-2 mx-5 mt-4"
      >
        Search Images
      </button>
      <Dimensions
        width={elementAttributes.width}
        height={elementAttributes.height}
        handleInputChange={handleInputChange}
        isEditingRef={isEditingRef}
      />
      <Text
        fontFamily={elementAttributes.fontFamily}
        fontSize={elementAttributes.fontSize}
        fontWeight={elementAttributes.fontWeight}
        handleInputChange={handleInputChange}
      />
      <Color
        inputRef={activeObjectRef}
        attribute={elementAttributes.fill}
        placeholder="Color"
        attributeType="fill"
        handleInputChange={handleInputChange}
      />
      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
