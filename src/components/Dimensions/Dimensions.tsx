import React from "react";
import { Label } from "../Lable/Lable";
import { Input } from "../Input/Input";

interface InputProps {
  width: string;
  height: string;
  isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
}

const dimensionsOptions = [
  { label: "W", property: "width" },
  { label: "H", property: "height" },
];

export const Dimensions = ({
  width,
  height,
  isEditingRef,
  handleInputChange,
}: InputProps) => {
  return (
    <section className="flex flex-col border-b border-primary-grey-200 outline-none">
      <div className="flex flex-col gap-4 px-6 py-3">
        {dimensionsOptions.map((item) => (
          <div
            key={item.label}
            className="flex flex-1 items-center gap-3 rounded-sm"
          >
            <Label htmlFor={item.property} className="text-[10px] font-bold">
              {item.label}
            </Label>
            <Input
              type="number"
              id={item.property}
              placeholder="100"
              value={item.property === "width" ? width : height}
              className="input-ring"
              min={10}
              onChange={(e: any) =>
                handleInputChange(item.property, e.target.value)
              }
              onBlur={(e: any) => {
                isEditingRef.current = false;
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
