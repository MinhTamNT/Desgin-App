import { Label } from "../Lable/Lable";
import { useRef } from "react";

type Props = {
  inputRef: any;
  attribute: string;
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string) => void;
};

const Color = ({
  inputRef,
  attribute,
  placeholder,
  attributeType,
  handleInputChange,
}: Props) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Handle color change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(attributeType, e.target.value);
  };

  // Format color for display (convert to uppercase and ensure # prefix)
  const displayColor = attribute?.startsWith('#') 
    ? attribute.toUpperCase() 
    : `#${attribute?.toUpperCase() || '000000'}`;

  return (
    <div className="flex flex-col gap-2 border-b border-primary-grey-200 p-4">
      <h3 className="text-xs font-semibold uppercase text-white">
        {placeholder}
      </h3>
      <div
        className="flex items-center gap-3 border border-primary-grey-200 rounded-md p-2 cursor-pointer hover:border-primary-blue-200"
        onClick={() => colorInputRef.current?.click()}
      >
        <div 
          className="w-6 h-6 rounded-full border border-gray-600"
          style={{ backgroundColor: displayColor }}
        />
        <input
          type="color"
          value={displayColor}
          ref={colorInputRef}
          onChange={handleColorChange}
          className="absolute opacity-0 w-0 h-0"
        />
        <Label className="flex-1 text-sm text-white font-mono">
          {displayColor}
        </Label>
      </div>
    </div>
  );
};

export default Color;
