import { memo, useRef } from "react";
import { image } from "../../assets/image/image";
import { ActiveUser } from "../../components/Avatar/AvavtarActive";
import { ActiveElement, NavbarProps } from "../../type/type";
import { navElements } from "../../utils";
import { NewThread } from "../../components/NewThread/NewThread";
import ShapesMenu from "../../components/ShapesMenu/ShapesMenu";
import { Button } from "../../components/Button/Button";
import { GoPlus } from "react-icons/go";
const NavbarProject = ({ activeElement }: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));
  const handleActiveElement = () => {};
  const handleImageUpload = () => {};
  const inputRef = useRef(null);
  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-[#2c2c2c] shadow-md px-5 text-black">
      <button className="bg-blue-500 uppercase flex items-center hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
        <GoPlus size={24} />
        Invite member
      </button>

      <ul className="flex flex-row">
        {navElements.map((items: ActiveElement | any) => (
          <li key={items.name}>
            {Array.isArray(items?.value) ? (
              <ShapesMenu
                item={items}
                activeElement={activeElement}
                handleActiveElement={handleActiveElement}
                handleImageUpload={handleImageUpload}
                imageInputRef={inputRef}
              />
            ) : items?.value === "comments" ? (
              <NewThread>
                <Button>
                  <img src={items.icon} alt={items.name} />
                </Button>
              </NewThread>
            ) : (
              <Button>
                <img
                  src={items.icon}
                  alt={items.name}
                  className={isActive(items.value) ? "invert" : ""}
                />
              </Button>
            )}
          </li>
        ))}
      </ul>
      <ActiveUser />
    </nav>
  );
};
export default memo(
  NavbarProject,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
