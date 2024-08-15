import { memo } from "react";
import { image } from "../../assets/image/image";
import { ActiveUser } from "../../components/Avatar/AvavtarActive";
import { NavbarProps } from "../../type/type";
const NavbarProject = ({ activeElement }: NavbarProps) => {
  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-white shadow-md px-5 text-black">
      <img src={image.logo} alt="Logo app" className="object-cover h-[60px]" />
      <ActiveUser />
    </nav>
  );
};
export default memo(
  NavbarProject,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
