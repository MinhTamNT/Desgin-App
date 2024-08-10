import { useState } from "react";
import { GoPlus } from "react-icons/go";
import { User } from "../lib/interface"; // Assume you have a User interface defined
import ProjectList from "../components/ListProject/ListProject";

// Sample user data - replace with your actual data source
const sampleUsers: any[] = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Alice Johnson" },
  { id: "4", name: "Bob Brown" },
];

interface Project {
  id: string;
  name: string;
}

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [step, setStep] = useState<"details" | "invite">("details");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Project Alpha" },
    { id: "2", name: "Project Beta" },
    { id: "3", name: "Project Gamma" },
  ]);

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

  const handleCreateProject = () => {
    console.log("Project Created:", {
      name: projectName,
      description: projectDescription,
      members: selectedMembers,
    });
    handleClose();
  };

  const handleAddMember = (user: User) => {
    setSelectedMembers((prev) => [...prev, user]);
    setSearchQuery(""); // Clear search query after adding
  };

  const handleSelectProject = (projectId: string) => {
    console.log("Selected Project ID:", projectId);
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
