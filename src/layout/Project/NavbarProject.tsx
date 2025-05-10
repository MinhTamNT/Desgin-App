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
            disabled = {userRole.isHost === false}
            className="bg-blue-500 uppercase p-2 flex items-center hover:bg-blue-700 text-white font-bold lg:py-2 lg:px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          >
            <GoPlus size={24} />
            Invite Member
          </button>

          {/* Project Visibility Toggle */}
          <div className="relative inline-block ml-3">
            <button 
              onClick={toggleVisibility}
              disabled={updatingVisibility || userRole.isHost === false}
              className="relative flex items-center justify-between bg-transparent border border-gray-600 hover:border-white text-white text-sm font-medium px-5 py-2.5 rounded-md transition-all duration-300 overflow-hidden group"
            >
              <div className="flex items-center space-x-2 z-10 relative">
                {updatingVisibility ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-2"></div>
                    <span>Updating...</span>
                  </>
                ) : visibility === "public" ? (
                  <>
                    <FaGlobe className="mr-2" size={16} />
                    <span>Public</span>
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" size={16} />
                    <span>Private</span>
                  </>
                )}
              </div>
              <div className="h-5 w-5 flex items-center justify-center ml-3 bg-gray-700 rounded-full transition-all duration-300 group-hover:bg-white group-hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-3 w-3">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {/* Background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 w-0 group-hover:w-full transition-all duration-300 ease-in-out -z-10"></div>
            </button>
          </div>
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
