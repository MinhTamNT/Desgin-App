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

  const navItemClass =
    "flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-indigo-50 hover:scale-[1.02] group";
  const iconClass =
    "text-indigo-400 group-hover:text-indigo-600 transition-colors duration-300";
  const textClass =
    "font-medium text-gray-700 group-hover:text-indigo-600 ml-4";

  return (
    <div className="hidden lg:flex flex-col w-72 p-6 bg-white border-r border-gray-100 min-h-screen">
      <div className="flex items-center justify-center mb-10">
        <img
          src={image.logo}
          alt="logo-app"
          className="h-72 w-auto object-contain"
        />
      </div>

      <nav className="space-y-2">
        <div onClick={() => navigateTo("/")} className={navItemClass}>
          <FaHome size={20} className={iconClass} />
          <span className={textClass}>Home</span>
        </div>
        <div
          onClick={() => navigateTo("/conversation")}
          className={navItemClass}
        >
          <FaProjectDiagram size={20} className={iconClass} />
          <span className={textClass}>Conversation</span>
        </div>
      </nav>

      <div className="mt-10">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Recent Projects
        </h3>
        <div className="space-y-1">
          {loading ? (
            <div className="animate-pulse p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
              Error: {error.message}
            </div>
          ) : (
            <ul className="space-y-1">
              {data.getRecentProjectsWithAccess.map((item: any) => (
                <li key={item.project_idProject}>
                  <div
                    onClick={() =>
                      navigateTo(`/project/${item.project_idProject}`)
                    }
                    className={navItemClass}
                  >
                    <FaProjectDiagram size={18} className={iconClass} />
                    <span className={`${textClass} truncate`}>
                      {item.projectName}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
