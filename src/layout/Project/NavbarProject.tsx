import { memo } from "react";
import { image } from "../../assets/image/image";
import { ActiveUser } from "../../components/Avatar/AvavtarActive";
import { ActiveElement, NavbarProps } from "../../type/type";
import { navElements } from "../../utils";
import { NewThread } from "../../components/NewThread/NewThread";
import ShapesMenu from "../../components/ShapesMenu/ShapesMenu";
import { Button } from "../../components/Button/Button";
const NavbarProject = ({ activeElement }: NavbarProps) => {
  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));
  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-white shadow-md px-5 text-black">
      <img src={image.logo} alt="Logo app" className="object-cover h-[60px]" />
      <ul className="flex flex-row">
        {navElements.map((items: ActiveElement | any) => (
          <li key={items.name}>
            {Array.isArray(items?.value) ? (
              <ShapesMenu item={items} activeElement={activeElement} />
            ) : items?.value === "comments" ? (
              <NewThread>
                <Button>
                  <img src={items.icon} alt={items.name} />
                </Button>
              </NewThread>
            ) : (
              <Button className="relative w-[60px]  object-contain">
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
