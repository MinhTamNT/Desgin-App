import React, { useMemo, useCallback, useState, useRef } from "react";
import {
  useQuery,
  useMutation,
  useApolloClient,
  useSubscription,
  useLazyQuery,
} from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { Project, User } from "../../lib/interface";
import {
  GET_PROJECT,
  DELETED_PROJECT,
  UPDATE_LASTETS_ACCESS,
  GET_MEMEBER_IN_PROJECT,
  ADD_PROJECT,
} from "../../utils/Project/Project";
import { dummyImages } from "../../assets/randomImage";
import { useNavigate } from "react-router-dom";
import { fetchUserRoleSuccess } from "../../Redux/roleSlice";
import { ErrorMessage } from "../../components/Error/ErrorMessage";
import { HeroSection } from "./components/HeroSection";
import { ProjectCard } from "./components/ProjectCard";
import { LoadingSkeleton } from "../../components/Loading/LoadingSkeleton";
import { image } from "../../assets/image/image";
import { gql } from "@apollo/client";
import { updateUserStatus } from "../../Redux/userStatusSlice";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiInfo, FiUsers, FiX } from "react-icons/fi";
import { SEARCH_USER } from "../../utils/User/User";
import debounce from "lodash/debounce";

interface ProjectMember {
  User: [{ idUser: string }];
  access: string;
  is_host_user: boolean;
}

const USER_STATUS_SUBSCRIPTION = gql`
  subscription OnUserStatusChanged {
    userStatusChanged {
      userId
      status
    }
  }
`;

export const Home: React.FC = () => {
  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser,
    (prev, next) => prev?.sub === next?.sub
  );
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Project creation modal state
  const [openModal, setOpenModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [step, setStep] = useState<"details" | "invite">("details");
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    data: ProjectList,
    loading,
    error,
    refetch,
  } = useQuery<{
    getUserProjects: {
      projects: Project[];
      pageInfo: {
        IND: number;
        TOTALROW: number;
      };
    };
  }>(GET_PROJECT, {
    variables: { pageIndex, pageSize, nameProject: search },
  });
  const [deleteProject] = useMutation(DELETED_PROJECT);
  const [updateLastAccess] = useMutation(UPDATE_LASTETS_ACCESS);
  const [createProject] = useMutation(ADD_PROJECT, {
    onCompleted: () => refetch(),
  });
  const [searchUser, { data: searchData }] = useLazyQuery(SEARCH_USER);
  const client = useApolloClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [totalRow, setTotalRow] = useState<number>(
    ProjectList?.getUserProjects?.pageInfo.TOTALROW || 0
  );
  const startIndex = (currentPage - 1) * pageSize;
  useSubscription(USER_STATUS_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (data?.data?.userStatusChanged) {
        const { userId, status } = data.data.userStatusChanged;
        dispatch(updateUserStatus({ userId, status }));
      }
    },
  });
  const statuses = useSelector((state: RootState) => state.userStatus.statuses);
  console.log(statuses);
  const projects = useMemo(
    () =>
      (ProjectList?.getUserProjects?.projects || []).map((project) => ({
        ...project,
        image: dummyImages[Math.floor(Math.random() * dummyImages.length)],
      })),
    [ProjectList?.getUserProjects?.projects]
  );

  const handleDelete = useCallback(
    async (idProject: string) => {
      try {
        const res = await deleteProject({
          variables: { projectId: idProject },
          refetchQueries: [{ query: GET_PROJECT }],
        });
        if (res.data.deletedProjectId.RetCode > 0) {
          toast.success(res.data.deletedProjectId.RetMessgae);
          await client.refetchQueries({
            include: [GET_PROJECT],
          });
        } else {
          toast.error(res.data.deletedProjectId.RetMessgae);
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    },
    [deleteProject]
  );

  const handleEdit = useCallback(
    async (idProject: string) => {
      try {
        await updateLastAccess({
          variables: { projectId: idProject },
        });

        const { data: membersProject } = await client.query({
          query: GET_MEMEBER_IN_PROJECT,
          variables: { projectId: idProject },
        });

        const members = membersProject?.getMememberInProject || [];
        const currentUserRole = members.find(
          (member: ProjectMember) => member.User[0].idUser === user?.sub
        );

        if (currentUserRole) {
          dispatch(
            fetchUserRoleSuccess({
              role: currentUserRole.access,
              isHost: currentUserRole.is_host_user,
            })
          );
          navigate(`/project/${idProject}`);
        } else {
          throw new Error("User not authorized for this project");
        }
      } catch (error) {
        console.error("Failed to edit project:", error);
      }
    },
    [updateLastAccess, client, user?.sub, dispatch, navigate]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPageIndex(1);
    },
    []
  );
  
  // Project creation modal functions
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      if (searchValue.trim()) {
        searchUser({ variables: { searchText: searchValue } });
      }
    }, 500),
    [searchUser]
  );
  
  const handleOpenModal = () => {
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
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
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSearchUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };
  
  const handleSelectUser = (user: User) => {
    setSelectedMembers((prev: User[]) => {
      const isSelected = prev.some((item) => item.idUser === user.idUser);
      let updatedMembers;
      if (isSelected) {
        updatedMembers = prev.filter((item) => item.idUser !== user.idUser);
      } else {
        updatedMembers = [...prev, user];
      }
      return updatedMembers;
    });
  };

  // Handle clicking outside to close modal
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };
    if (openModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openModal]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const totalPages = Math.ceil(totalRow / pageSize);
      return Math.min(prevPage + 1, totalPages);
    });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const paginatedProjects = projects.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection userName={user?.name} />
      
      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10"
      >
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}
            className="bg-white rounded-xl p-5 shadow-md border border-blue-100 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h4 className="text-3xl font-bold text-gray-800">{projects?.[0]?.OwnedProjects ?? 0}</h4>
            <p className="text-sm text-gray-500 mt-1">Total Projects</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1)' }}
            className="bg-white rounded-xl p-5 shadow-md border border-green-100 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className="text-3xl font-bold text-gray-800">
              {projects?.[0]?.OwnedProjects ?? 0}
            </h4>
            <p className="text-sm text-gray-500 mt-1">Owned Projects</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.1)' }}
            className="bg-white rounded-xl p-5 shadow-md border border-purple-100 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="text-3xl font-bold text-gray-800">{projects?.[0]?.PublicProjectCount ?? 0}</h4>
            <p className="text-sm text-gray-500 mt-1">Shared Projects</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.1)' }}
            className="bg-white rounded-xl p-5 shadow-md border border-orange-100 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-3xl font-bold text-gray-800">
              {projects.filter((p) => new Date(p.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </h4>
            <p className="text-sm text-gray-500 mt-1">Active This Week</p>
          </motion.div>
        </div>
        
        {/* Projects Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Your Creative Projects</h2>
              <p className="text-gray-500 mt-1">Explore and manage your creative workflow</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {/* Search Bar */}
              <div className={`relative transition-all duration-200 ${isSearchFocused ? 'w-64' : 'w-48'}`}>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode("grid")} 
                  className={`flex items-center justify-center px-3 py-1.5 rounded ${viewMode === 'grid' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'}`}
                >
                  <FiGrid className="mr-1" /> Grid
                </button>
                <button 
                  onClick={() => setViewMode("list")} 
                  className={`flex items-center justify-center px-3 py-1.5 rounded ${viewMode === 'list' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'}`}
                >
                  <FiList className="mr-1" /> List
                </button>
              </div>
              
              {/* Create New Button */}
              <button 
                onClick={handleOpenModal}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
              >
                <FiPlus className="mr-1" /> New Project
              </button>
            </div>
          </div>
          
          {/* Projects Content */}
          <div className="p-6">
            {loading ? (
              <LoadingSkeleton />
            ) : projects.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16 rounded-xl border-2 border-dashed border-gray-200"
              >
                <img
                  src={image.first}
                  alt="No projects"
                  className="mx-auto h-40 mb-6 opacity-70"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Projects Yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Begin your creative journey by creating your first project
                </p>
                <button 
                  onClick={handleOpenModal}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <FiPlus className="inline mr-2" /> Create New Project
                </button>
              </motion.div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProjects.map((project, index) => (
                      <motion.div
                        key={project.idProject}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ProjectCard
                          project={project}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProjects.map((project, index) => (
                      <motion.div
                        key={project.idProject}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-16 h-16 rounded-lg bg-cover bg-center mr-4" 
                            style={{ backgroundImage: `url(${project.image})` }}
                          />
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">{project.name}</h3>
                            <p className="text-sm text-gray-500">Last updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(project.idProject)}
                            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors duration-200"
                          >
                            Open
                          </button>
                          <button 
                            onClick={() => handleDelete(project.idProject)}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {/* Pagination */}
            {totalRow > pageSize && (
              <div className="flex justify-between items-center mt-8 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalRow)} of {totalRow} projects
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center p-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <FiChevronLeft />
                  </button>
                  <div className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium">
                    Page {currentPage} of {Math.ceil(totalRow / pageSize)}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= Math.ceil(totalRow / pageSize)}
                    className={`flex items-center justify-center p-2 rounded-md ${currentPage >= Math.ceil(totalRow / pageSize) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
      {/* Project Creation Modal */}
      <AnimatePresence>
        {openModal && (
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
                  onClick={handleCloseModal}
                  className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX size={20} />
                </button>
                
                <div className="flex items-center mb-2">
                  <div className="flex space-x-2 items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      <FiInfo size={16} />
                    </div>
                    <div className={`h-0.5 w-8 ${step === 'invite' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'invite' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                              className="flex items-center bg-blue-500 text-white text-sm px-3 py-1 rounded-full"
                            >
                              <span className="mr-1">{member.name}</span>
                              <button onClick={() => handleSelectUser(member)} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200">
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
                        <div className="p -4 text-center text-gray-500 dark:text-gray-400">
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
                        if (user?.idUser !== user?.sub) {
                          isSelected = selectedMembers.some(
                            (item) => item.idUser === user.idUser
                          );
                        }

                        return (
                          <motion.div
                            key={user.idUser}
                            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                            className={`flex items-center p-3 cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-500 text-white" : ""
                            }`}
                            onClick={() => handleSelectUser(user)}
                          >
                            {user?.idUser === user?.sub ? (
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
                                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-medium">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                                  {user.email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>}
                                </div>
                                {isSelected && (
                                  <div className="ml-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
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
              
              {/* Footer */}
              <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                {step === "details" ? (
                  <>
                    <button
                      onClick={handleCloseModal}
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
    </div>
  );
};
