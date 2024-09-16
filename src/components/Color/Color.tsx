import { Label } from "../Lable/Lable";

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
}: Props) => (
  <div className="flex flex-col gap-2 border-b border-primary-grey-200 p-4">
    <h3 className="text-xs font-semibold uppercase text-white">
      {placeholder}
    </h3>
    <div
      className="flex items-center gap-3 border border-primary-grey-200 rounded-md p-2 cursor-pointer hover:border-primary-blue-200"
      onClick={() => inputRef.current.click()}
    >
      <input
        type="color"
        value={attribute}
        ref={inputRef}
        onChange={(e) => handleInputChange(attributeType, e.target.value)}
        className="w-6 h-6 rounded-full border-none outline-none cursor-pointer"
        style={{ appearance: "none" }}
      />
      <Label className="flex-1 text-sm text-white">
        {attribute}
      </Label>
      <Label className="flex h-6 w-8 text-white items-center justify-center bg-primary-grey-100 text-[10px] leading-3  rounded-sm">
        90%
      </Label>
    </div>
  </div>
);

export default Color;
