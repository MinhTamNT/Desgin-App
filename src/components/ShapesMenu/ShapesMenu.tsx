import React from "react";
import Menu from "@mui/material/Menu";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { ShapesMenuProps } from "../../type/type";
import { motion } from "framer-motion";

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
        className="relative h-10 w-10 object-contain group transition-all duration-200"
        style={{ 
          padding: 0,
          minWidth: 'unset',
          borderRadius: 0,
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-full h-full"
        >
          <img
            src={isDropdownElem ? activeElement.icon : item.icon}
            alt={item.name}
            className={`w-6 h-6 object-contain filter brightness-0 invert transition-all duration-200`}
          />
        </motion.div>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          mt: 1,
          "& .MuiPaper-root": {
            background: 'linear-gradient(135deg, #1e1e1e, #050505)',
            color: '#fff',
            minWidth: "200px",
            borderRadius: 0,
            boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)"
          },
          "& .MuiList-root": {
            padding: "4px 0",
          }
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        {item.value.map((elem) => (
          <ListItem
            button
            key={elem?.name}
            sx={{
              background: activeElement.value === elem?.value 
                ? 'linear-gradient(90deg, #000000, #121212)' 
                : 'transparent',
              color: activeElement.value === elem?.value ? '#ffffff' : '#e0e0e0',
              padding: "12px 16px",
              margin: "3px 4px",
              borderLeft: activeElement.value === elem?.value 
                ? "3px solid #ffffff" 
                : "3px solid transparent",
              transition: "all 0.15s ease-in-out",
              "&:hover": {
                background: 'linear-gradient(90deg, rgba(40,40,40,0.9), rgba(20,20,20,0.9))',
                borderLeft: "3px solid rgba(255,255,255,0.6)",
                color: '#ffffff',
              },
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: "rgba(255,255,255,0.03)",
              }
            }}
            onClick={() => {
              handleActiveElement(elem);
              handleClose();
            }}
          >
            <div className="flex items-center space-x-3 w-full">
              <img
                src={elem?.icon}
                alt={elem?.name}
                width={20}
                height={20}
                className={`${activeElement.value === elem?.value ? "brightness-0 invert" : "opacity-80"} transition-all duration-200`}
              />
              <p
                className={`text-sm font-medium transition-all duration-200`}
              >
                {elem?.name}
              </p>
            </div>
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
