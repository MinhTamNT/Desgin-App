import { useQuery } from "@apollo/client";
import { FaHome, FaProjectDiagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { image } from "../assets/image/image";
import { GET_RECENET_PROJECT } from "../utils/Project/Project";

export const Navbar = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_RECENET_PROJECT);

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return (
    <div className="hidden lg:flex flex-col w-64 p-6 bg-white text-black shadow-lg rounded-lg">
      <div className="flex items-center justify-center mb-8">
        <img src={image.logo} alt="logo-app" className="h-35 object-cover" />
      </div>
      <nav className="flex flex-col space-y-4">
        <div
          onClick={() => navigateTo("/")}
          className="flex items-center shadow-md space-x-4 p-4 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors duration-300"
        >
          <FaHome size={24} className="text-gray-300" />
          <span className="font-medium">Home</span>
        </div>
        <div
          onClick={() => navigateTo("/conversation")}
          className="flex items-center shadow-md space-x-4 p-4 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors duration-300"
        >
          <FaProjectDiagram size={24} className="text-gray-300" />
          <span className="font-medium">Conversation</span>
        </div>
      </nav>

      {/* Recent Items Section */}
      <div className="mt-8">
        <h3 className="text-gray-400 font-semibold mb-3">Recent Projects</h3>
        <ul className="space-y-2">
          {loading ? (
            <li className="text-gray-500">Loading...</li>
          ) : error ? (
            <li className="text-red-500">Error: {error.message}</li>
          ) : (
            data.getRecentProjectsWithAccess.map((item: any) => (
              <li key={item.project_idProject}>
                <div
                  onClick={() =>
                    navigateTo(`/project/${item.project_idProject}`)
                  }
                  className="flex items-center shadow-md space-x-4 p-4 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors duration-300"
                >
                  <FaProjectDiagram size={24} className="text-gray-300" />
                  <span className="font-medium">
                    {item.projectName}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
