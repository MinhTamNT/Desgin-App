import { memo, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useParams } from "react-router-dom";
import { FaLock, FaGlobe } from "react-icons/fa";
import { useMutation } from "@apollo/client";

import { ActiveUser } from "../../components/Avatar/AvavtarActive";
import { Button } from "../../components/Button/Button";
import { NewThread } from "../../components/NewThread/NewThread";
import ShapesMenu from "../../components/ShapesMenu/ShapesMenu";
import { User } from "../../lib/interface";
import { ActiveElement, NavbarProps } from "../../type/type";
import { navElements } from "../../utils";
import ManageMembersModal from "../../components/MemberRoleModalProps/MemberRoleModalProps";
import { toast } from "react-toastify";
import { UPDATE_PROJECT_VISIBILITY } from "../../utils/Project/Project";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

const NavbarProject = ({
  activeElement,
  handleActiveElement,
  handleImageUpload,
  imageInputRef,
  projectVisibility = "private",
}: NavbarProps) => {
  const [modalOpen, setModalOpen] = useState(false); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [visibility, setVisibility] = useState(projectVisibility);
  const { idProject } = useParams();
  const [updateVisibility, { loading: updatingVisibility }] = useMutation(UPDATE_PROJECT_VISIBILITY);
  
  const userRole = useSelector(
      (state: RootState) => state?.role?.role?.userRole
    );
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

  const triggerImportInput = () => {
    if (importInputRef.current) {
      importInputRef.current.click();
    }
  };

  const toggleVisibility = async () => {
    const newVisibility = visibility === "public" ? "private" : "public";
    try {
      const response = await updateVisibility({
        variables: {
          projectId: idProject,
          visibility: newVisibility
        }
      });
      
      if (response.data?.UpdateProjectVisibility?.RetCode > 0) {
        setVisibility(newVisibility);
        toast.success(`Project is now ${newVisibility}`);
      } else {
        toast.error(response.data?.updateProjectVisibility?.RetMessgae || "Failed to update visibility");
      }
    } catch (error) {
      toast.error("Failed to update project visibility");
      console.error(error);
    }
  };

  return (
    <>
      <nav className="flex select-none flex-wrap items-center justify-between gap-4 bg-[#2c2c2c] shadow-md px-5 py-3 text-black">
        <div className="flex gap-2">
        <button
            onClick={handleOpenManageMembersModal} 
            disabled={userRole?.isHost === false}
            className={`
              flex items-center gap-2 px-4 py-2 rounded 
              transition-all duration-300 font-medium text-sm
              ${userRole?.isHost 
                ? "bg-white text-black hover:bg-gray-200" 
                : "bg-gray-700 text-gray-400 cursor-not-allowed"}
            `}
          >
            <GoPlus size={18} />
            <span>Invite</span>
          </button>

          {/* Project Visibility Toggle */}
          <button 
            onClick={toggleVisibility}
            disabled={updatingVisibility || userRole?.isHost === false}
            className={`
              flex items-center gap-2 px-4 py-2 rounded
              transition-all duration-300 font-medium text-sm
              ${userRole?.isHost && !updatingVisibility 
                ? "bg-white border border-gray-700 hover:border-white" 
                : "text-gray-400 cursor-not-allowed"}
            `}
          >
            {updatingVisibility ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : visibility === "public" ? (
              <>
                <FaGlobe size={14} />
                <span>Public</span>
              </>
            ) : (
              <>
                <FaLock size={14} />
                <span>Private</span>
              </>
            )}
          </button>
        </div>

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
                      className={`w-6 h-6 object-contain invert filter brightness-0 ${isActive(items.value) ? "" : ""}`}
                    />
                  </Button>
                </NewThread>
              ) : (
                <Button>
                  <img
                    src={items.icon}
                    alt={items.name}
                    className={`w-6 h-6 object-contain invert filter brightness-0 ${isActive(items.value) ? "" : ""}`}
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
