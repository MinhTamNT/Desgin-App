import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import {
  fontFamilyOptions,
  fontSizeOptions,
  fontWeightOptions,
} from "../../utils/index";

const selectConfigs = [
  {
    property: "fontFamily",
    placeholder: "Choose a font",
    options: fontFamilyOptions,
  },
  { property: "fontSize", placeholder: "30", options: fontSizeOptions },
  {
    property: "fontWeight",
    placeholder: "Semibold",
    options: fontWeightOptions,
  },
];

type TextProps = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  handleInputChange: (property: string, value: string) => void;
};

const Text = ({
  fontFamily,
  fontSize,
  fontWeight,
  handleInputChange,
}: TextProps) => (
  <div className="flex flex-col gap-3 border-b border-primary-grey-200 px-5 py-3">
    <h3 className="text-[10px] uppercase">Text</h3>

    <div className="flex flex-col gap-3">
      <RenderSelect
        config={selectConfigs[0]}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily={fontFamily}
        handleInputChange={handleInputChange}
      />

      <div className="flex gap-2">
        {selectConfigs.slice(1).map((config) => (
          <RenderSelect
            key={config.property}
            config={config}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontFamily={fontFamily}
            handleInputChange={handleInputChange}
          />
        ))}
      </div>
    </div>
  </div>
);

type Props = {
  config: {
    property: string;
    placeholder: string;
    options: { label: string; value: string }[];
  };
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  handleInputChange: (property: string, value: string) => void;
};

const RenderSelect = ({
  config,
  fontSize,
  fontWeight,
  fontFamily,
  handleInputChange,
}: Props) => (
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
    <InputLabel>{config.placeholder}</InputLabel>
    <Select
      label={config.placeholder}
      value={
        config.property === "fontFamily"
          ? fontFamily
          : config.property === "fontSize"
          ? fontSize
          : fontWeight
      }
      onChange={(e) => handleInputChange(config.property, e.target.value)}
    >
      {config.options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default Text;
