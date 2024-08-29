import React from "react";
import Menu from "@mui/material/Menu";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { ShapesMenuProps } from "../../type/type";

const ShapesMenu = ({
  item,
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
}: ShapesMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDropdownElem = item.value.some(
    (elem) => elem?.value === activeElement.value
  );

  return (
    <>
      <Button
        onClick={handleClick}
        className="relative h-10 w-10 object-contain"
      >
        <img
          src={isDropdownElem ? activeElement.icon : item.icon}
          alt={item.name}
          className={isDropdownElem ? "invert" : ""}
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#333",
            color: "#fff",
            minWidth: "150px",
          },
        }}
      >
        {item.value.map((elem) => (
          <ListItem
            button
            key={elem?.name}
            sx={{
              backgroundColor:
                activeElement.value === elem?.value ? "#3f51b5" : "#333",
              color: activeElement.value === elem?.value ? "#fff" : "#ddd",
              "&:hover": {
                backgroundColor: "#555",
              },
            }}
            onClick={() => {
              handleActiveElement(elem);
              console.log(elem)
              handleClose();
            }}
          >
            <img
              src={elem?.icon}
              alt={elem?.name}
              width={20}
              height={20}
              className={activeElement.value === elem?.value ? "invert" : ""}
              style={{ marginRight: "8px" }}
            />
            <p
              className={`text-sm ${
                activeElement.value === elem?.value
                  ? "text-primary-black"
                  : "text-white"
              }`}
            >
              {elem?.name}
            </p>
          </ListItem>
        ))}
      </Menu>
      <input
        type="file"
        className="hidden"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </>
  );
};

export default ShapesMenu;
