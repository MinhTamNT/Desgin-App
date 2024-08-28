import { useState } from "react";
import { GoPlus } from "react-icons/go";
import { Project, User } from "../lib/interface";
import ProjectList from "../components/ListProject/ListProject";
import { useMutation, useQuery } from "@apollo/client";
import { ADD_PROJECT, GET_PROJECT } from "../utils/Project/Project";
import { useNavigate } from "react-router-dom";

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [step, setStep] = useState<"details" | "invite">("details");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { data, refetch } = useQuery<{ getUserProjects: Project[] }>(
    GET_PROJECT
  );
  const projects = data?.getUserProjects || [];

  const [createProject] = useMutation(ADD_PROJECT, {
    onCompleted: () => refetch(),
  });

  const handleClickOpen = () => {
    setOpen(true);
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
        },
      });
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMember = (user: User) => {
    setSelectedMembers((prev) => [...prev, user]);
    setSearchQuery("");
  };

  const handleSelectProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 mb-4"
                    />

                    {selectedMembers.length === 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        No members selected yet.
                      </p>
                    )}
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
