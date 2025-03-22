import { useCallback, useState } from "react";
import { GoPlus } from "react-icons/go";
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

  return (
    <>
      <aside className="fixed z-10 left-0 top-0 bg-gradient-to-b from-gray-800 to-gray-900 h-full w-16 flex flex-col items-center p-4 shadow-lg">
        <ProjectList
          projects={projects}
          onSelectProject={handleSelectProject}
        />
        <button
          onClick={handleClickOpen}
          className="bg-blue-500 hover:bg-blue-600 p-3 rounded-full shadow-lg transition duration-300 ease-in-out"
        >
          <GoPlus size={24} />
        </button>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-lg">
            {step === "details" ? (
              <>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Create New Project
                  </h2>
                  <div className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                    <textarea
                      placeholder="Project Description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200">
                  <button
                    onClick={handleClose}
                    className="text-gray-600 hover:text-gray-800 mr-4"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Invite Members
                  </h2>
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Search for members"
                      value={searchQuery}
                      onChange={handleSearchUser}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 mb-4"
                    />

                    {selectedMembers.length === 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        No members selected yet.
                      </p>
                    )}
                    {searchData?.searchUserByName?.map((user: User) => {
                      let isSelected = false;
                      if (user?.idUser !== currentUser?.sub) {
                        isSelected = selectedMembers.some(
                          (item) => item.idUser === user.idUser
                        );
                      }

                      return (
                        <div
                          key={user.idUser}
                          className={`flex items-center space-x-2 cursor-pointer ${
                            isSelected ? "bg-blue-100 rounded-md" : ""
                          }`}
                          onClick={() => handleSelectUser(user)}
                        >
                          {user?.idUser === currentUser?.sub ? (
                            <p>Not Found User</p>
                          ) : (
                            <>
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="h-10 rounded-full"
                              />
                              <span className="text-gray-800">{user.name}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200">
                  <button
                    onClick={() => setStep("details")}
                    className="text-gray-600 hover:text-gray-800 mr-4"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md"
                  >
                    Create
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
