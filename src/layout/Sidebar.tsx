import { useCallback, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoPlus } from "react-icons/go";
import { FiSearch, FiX, FiUsers, FiChevronLeft, FiChevronRight, FiInfo } from "react-icons/fi";
import { Project, User } from "../lib/interface";
import ProjectList from "../components/ListProject/ListProject";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { ADD_PROJECT, GET_PROJECT } from "../utils/Project/Project";
import { useNavigate } from "react-router-dom";
import { SEARCH_USER } from "../utils/User/User";
import debounce from "lodash/debounce";
import { RootState } from "../Redux/store";
import { useSelector } from "react-redux";
export const Sidebar = () => {
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [step, setStep] = useState<"details" | "invite">("details");
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, refetch } = useQuery<{
    getUserProjects: {
      projects: Project[];
      pageInfo: {
        IND: number;
        TOTALROW: number;
      };
    };
  }>(GET_PROJECT, {
    variables: { pageIndex: 1, pageSize: 10, nameProject: "" },
  });
  const projects = data?.getUserProjects?.projects || [];
  const [searchUser, { data: searchData }] = useLazyQuery(SEARCH_USER);
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      if (searchValue.trim()) {
        searchUser({ variables: { searchText: searchValue } });
      }
    }, 500),
    [searchUser]
  );
  const [createProject] = useMutation(ADD_PROJECT, {
    onCompleted: () => refetch(),
  });

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };
  const handleClose = () => {
    setOpen(false);
    setStep("details");
    setProjectName("");
    setProjectDescription("");
    setSelectedMembers([]);
    setSearchQuery("");
  };

  const handleNext = () => {
    if (step === "details") {
      setStep("invite");
    } else {
      handleCreateProject();
    }
  };

  const handleCreateProject = async () => {
    try {
      await createProject({
        variables: {
          name: projectName,
          description: projectDescription,
          listInvite: selectedMembers.map((user) => user.idUser).join(","),
        },
      });
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleSelectUser = (user: User) => {
    console.log(user);
    setSelectedMembers((prev: User[]) => {
      const isSelected = prev.some((item) => item.idUser === user.idUser);
      let updatedMembers;
      if (isSelected) {
        updatedMembers = prev.filter((item) => item.idUser !== user.idUser);
      } else {
        updatedMembers = [...prev, user];
      }
      console.log(updatedMembers);
      return updatedMembers;
    });
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <motion.aside 
        className="fixed z-10 left-0 top-0 h-full flex flex-col items-center shadow-lg"
        initial={{ width: '4rem' }}
        animate={{ width: isHovered ? '14rem' : '4rem' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="w-full h-full bg-gray-800 flex flex-col items-center pt-4 pb-4 overflow-hidden">
          <div className="flex items-center justify-center mb-6 w-full">
            <div className="relative flex items-center justify-center">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-white font-bold text-xl">P</span>
              </motion.div>
              
              <AnimatePresence>
                {isHovered && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 text-white font-medium"
                  >
                    Pixel
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex-1 w-full overflow-hidden">
            <ProjectList
              projects={projects}
              onSelectProject={handleSelectProject}
            />
          </div>
          
          <motion.button
            onClick={handleClickOpen}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mt-4 bg-blue-500 hover:bg-blue-600 p-3 rounded-full shadow-lg transition-all duration-300"
          >
            <GoPlus size={24} className="text-white" />
          </motion.button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50"
          >
            <motion.div 
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden"
            >
              {/* Header with step indicator */}
              <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700 relative">
                <button 
                  onClick={handleClose}
                  className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX size={20} />
                </button>
                
                <div className="flex items-center mb-2">
                  <div className="flex space-x-2 items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      <FiInfo size={16} />
                    </div>
                    <div className={`h-0.5 w-8 ${step === 'invite' ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'invite' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      <FiUsers size={16} />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {step === 'details' ? 'Create New Project' : 'Invite Team Members'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {step === 'details' 
                    ? 'Get started by filling in the information below to create your new project.'
                    : 'Search and select team members to collaborate with.'}
                </p>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {step === "details" ? (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -10, opacity: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter project name..."
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Project Description
                      </label>
                      <textarea
                        placeholder="Describe your project..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        rows={4}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Give your project a description to help team members understand its purpose.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                  >
                    <div className="relative mb-5">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search members by name..."
                        value={searchQuery}
                        onChange={handleSearchUser}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    {/* Selected Members */}
                    {selectedMembers.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selected ({selectedMembers.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedMembers.map(member => (
                            <div 
                              key={`selected-${member.idUser}`}
                              className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm px-3 py-1 rounded-full"
                            >
                              <span className="mr-1">{member.name}</span>
                              <button onClick={() => handleSelectUser(member)} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200">
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* User Search Results */}
                    <div className="max-h-60 overflow-y-auto mt-2 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                      {searchData?.searchUserByName?.length === 0 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No users found. Try a different search term.
                        </div>
                      )}
                      
                      {!searchQuery && selectedMembers.length === 0 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          Search for team members to add to your project.
                        </div>
                      )}
                      
                      {searchData?.searchUserByName?.map((user: User) => {
                        let isSelected = false;
                        if (user?.idUser !== currentUser?.sub) {
                          isSelected = selectedMembers.some(
                            (item) => item.idUser === user.idUser
                          );
                        }

                        return (
                          <motion.div
                            key={user.idUser}
                            whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                            className={`flex items-center p-3 cursor-pointer transition-colors ${
                              isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                            }`}
                            onClick={() => handleSelectUser(user)}
                          >
                            {user?.idUser === currentUser?.sub ? (
                              <div className="text-gray-500 dark:text-gray-400 w-full text-center p-2">
                                No matching users found
                              </div>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3 flex-shrink-0">
                                  {user.profilePicture ? (
                                    <img
                                      src={user.profilePicture}
                                      alt={user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-medium">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                                  {user.email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>}
                                </div>
                                {isSelected && (
                                  <div className="ml-2 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                  </div>
                                )}
                              </>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
              
              <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                {step === "details" ? (
                  <>
                    <button
                      onClick={handleClose}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      onClick={handleNext}
                      disabled={!projectName.trim()}
                      whileHover={projectName.trim() ? { scale: 1.02 } : {}}
                      whileTap={projectName.trim() ? { scale: 0.98 } : {}}
                      className={`flex items-center px-5 py-2.5 rounded-lg font-medium shadow-sm ${
                        projectName.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                      }`}
                    >
                      Continue 
                      <FiChevronRight className="ml-1" size={16} />
                    </motion.button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setStep("details")}
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                    >
                      <FiChevronLeft className="mr-1" size={16} />
                      Back
                    </button>
                    <motion.button
                      onClick={handleCreateProject}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm"
                    >
                      Create Project
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
