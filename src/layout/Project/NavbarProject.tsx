import { memo, useState } from "react";
import { GoPlus } from "react-icons/go";
import { ActiveUser } from "../../components/Avatar/AvavtarActive";
import { Button } from "../../components/Button/Button";
import { NewThread } from "../../components/NewThread/NewThread";
import ShapesMenu from "../../components/ShapesMenu/ShapesMenu";
import { User } from "../../lib/interface";
import { ActiveElement, NavbarProps } from "../../type/type";
import { navElements } from "../../utils";
import ManageMembersModal from "../../components/MemberRoleModalProps/MemberRoleModalProps";

const NavbarProject = ({
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
}: NavbarProps) => {
  const [modalOpen, setModalOpen] = useState(false); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) &&
      value.some((val) => val?.value === activeElement?.value));

  const handleOpenManageMembersModal = () => {
    setModalOpen(true); 
  };

  const handleCloseManageMembersModal = () => {
    setModalOpen(false); 
  };

  return (
    <>
      <nav className="flex select-none flex-wrap items-center justify-between gap-4 bg-[#2c2c2c] shadow-md px-5 py-3 text-black">
        <button
          onClick={handleOpenManageMembersModal} 
          className="bg-blue-500 uppercase p-2 flex items-center hover:bg-blue-700 text-white font-bold lg:py-2 lg:px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
        >
          <GoPlus size={24} />
          Invite Member
        </button>

        <ul className="flex flex-row flex-wrap">
          {navElements.map((items: ActiveElement | any) => (
            <li
              onClick={() => {
                if (Array.isArray(items.value)) return;
                handleActiveElement(items);
              }}
              key={items.name}
              className={` px-2.5 flex justify-center items-center rounded-lg 
              ${isActive(items.value) ? "bg-red-400" : "hover:bg-gray-500"}
              `}
            >
              {Array.isArray(items?.value) ? (
                <ShapesMenu
                  item={items}
                  activeElement={activeElement}
                  handleActiveElement={handleActiveElement}
                  handleImageUpload={handleImageUpload}
                  imageInputRef={imageInputRef}
                />
              ) : items?.value === "comments" ? (
                <NewThread>
                  <Button>
                    <img
                      src={items.icon}
                      alt={items.name}
                      className={isActive(items.value) ? "invert" : ""}
                    />
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

      <ManageMembersModal
        open={modalOpen}
        onClose={handleCloseManageMembersModal}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
    </>
  );
};

export default memo(
  NavbarProject,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
