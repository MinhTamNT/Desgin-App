import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import {
  fontFamilyOptions,
  fontSizeOptions,
  fontWeightOptions,
} from "../../utils/index";
import { TwitterPicker } from "react-color";
import { useState } from "react";
import { FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";

type TextProps = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  textColor?: string;
  textAlign?: string;
  backgroundColor?: string;
  handleInputChange: (property: string, value: string) => void;
};

const Text = ({
  fontFamily,
  fontSize,
  fontWeight,
  textColor,
  textAlign = "left",
  backgroundColor,
  handleInputChange,
}: TextProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const handleTextColorChange = (color: any) => {
    handleInputChange("textColor", color.hex);
    setShowColorPicker(false);
  };

  const handleBgColorChange = (color: any) => {
    handleInputChange("backgroundColor", color.hex);
    setShowBgColorPicker(false);
  };

  return (
    <div className="flex flex-col gap-3 border-b border-primary-grey-200 px-5 py-3">
      <h3 className="text-[10px] uppercase">Text</h3>

      <div className="flex flex-col gap-3">
        <FormControl
          fullWidth
          variant="filled"
          size="small"
          sx={{
            "& .MuiInputBase-root": {
              backgroundColor: "black",
              color: "white",
            },
            "& .MuiInputLabel-root": {
              color: "white",
            },
            "& .MuiSvgIcon-root": {
              color: "white",
            },
          }}
        >
          <InputLabel>Font Family</InputLabel>
          <Select
            label="Font Family"
            value={fontFamily}
            onChange={(e) => handleInputChange("fontFamily", e.target.value)}
          >
            {fontFamilyOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="flex gap-2">
          <FormControl
            fullWidth
            variant="filled"
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "black",
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}
          >
            <InputLabel>Font Size</InputLabel>
            <Select
              label="Font Size"
              value={fontSize}
              onChange={(e) => handleInputChange("fontSize", e.target.value)}
            >
              {fontSizeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            variant="filled"
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "black",
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "white",
              },
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}
          >
            <InputLabel>Font Weight</InputLabel>
            <Select
              label="Font Weight"
              value={fontWeight}
              onChange={(e) => handleInputChange("fontWeight", e.target.value)}
            >
              {fontWeightOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Text Alignment Controls */}
        <div className="mt-2">
          <InputLabel 
            sx={{ 
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              transform: 'none',
              marginBottom: '4px'
            }}
          >
            Text Alignment
          </InputLabel>
          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 py-2 flex items-center justify-center rounded-md transition-all ${
                textAlign === "left"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => handleInputChange("textAlign", "left")}
            >
              <FaAlignLeft />
            </button>
            <button
              type="button"
              className={`flex-1 py-2 flex items-center justify-center rounded-md transition-all ${
                textAlign === "center"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => handleInputChange("textAlign", "center")}
            >
              <FaAlignCenter />
            </button>
            <button
              type="button"
              className={`flex-1 py-2 flex items-center justify-center rounded-md transition-all ${
                textAlign === "right"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => handleInputChange("textAlign", "right")}
            >
              <FaAlignRight />
            </button>
          </div>
        </div>

        {/* Text Color Picker */}
        <div className="mt-2">
          <InputLabel 
            sx={{ 
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              transform: 'none',
              marginBottom: '4px'
            }}
          >
            Text Color
          </InputLabel>
          <div 
            className="w-full h-10 flex items-center px-3 cursor-pointer rounded"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <div 
              className="w-5 h-5 rounded-sm mr-2" 
              style={{ backgroundColor: textColor || '#ffffff' }}
            />
            <span className="text-xs text-white">{textColor || '#ffffff'}</span>
          </div>
          
          {showColorPicker && (
            <div className="absolute z-10 mt-1">
              <div 
                className="fixed inset-0" 
                onClick={() => setShowColorPicker(false)}
              />
              <TwitterPicker 
                color={textColor || '#ffffff'} 
                onChange={handleTextColorChange}
                colors={['#000000', '#ffffff', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B']}
              />
            </div>
          )}
        </div>

        {/* Background Color Picker */}
        <div className="mt-4">
          <InputLabel 
            sx={{ 
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.7)',
              transform: 'none',
              marginBottom: '4px'
            }}
          >
            Background Color
          </InputLabel>
          <div 
            className="w-full h-10 flex items-center px-3 cursor-pointer rounded"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
          >
            <div 
              className="w-5 h-5 rounded-sm mr-2" 
              style={{ backgroundColor: backgroundColor || 'transparent' }}
            />
            <span className="text-xs text-white">{backgroundColor || 'transparent'}</span>
          </div>
          
          {showBgColorPicker && (
            <div className="absolute z-10 mt-1">
              <div 
                className="fixed inset-0" 
                onClick={() => setShowBgColorPicker(false)}
              />
              <TwitterPicker 
                color={backgroundColor || 'transparent'} 
                onChange={handleBgColorChange}
                colors={['transparent', '#000000', '#ffffff', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B']}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Text;
