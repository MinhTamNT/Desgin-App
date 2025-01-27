import { useQuery } from "@apollo/client";
import { FaHome, FaProjectDiagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { image } from "../assets/image/image";
import { GET_PROJECT } from "../utils/Project/Project";
import { Project } from "../lib/interface";
import { useCallback } from "react";

interface ProjectsData {
  getUserProjects: {
    projects: Project[];
    pageInfo: {
      IND: number;
      TOTALROW: number;
    };
  };
}

const STYLES = {
  navItem:
    "flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 hover:bg-indigo-50 hover:scale-[1.02] group",
  icon: "text-indigo-400 group-hover:text-indigo-600 transition-colors duration-300",
  text: "font-medium text-gray-700 group-hover:text-indigo-600 ml-4",
} as const;

const ProjectList = ({
  data,
  loading,
  error,
  onProjectClick,
}: {
  data?: ProjectsData;
  loading: boolean;
  error?: Error;
  onProjectClick: (id: string) => void;
}) => {
  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
        Error: {error.message}
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {data?.getUserProjects.projects?.map((item: Project) => (
        <li key={item.idProject}>
          <div
            onClick={() => onProjectClick(item.idProject)}
            className={STYLES.navItem}
          >
            <FaProjectDiagram size={18} className={STYLES.icon} />
            <span className={`${STYLES.text} truncate`}>{item.name}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export const Navbar = () => {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<ProjectsData>(GET_PROJECT, {
    variables: { pageIndex: 1, pageSize: 10, nameProject: "" },
  });

  const navigateTo = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const handleProjectClick = useCallback(
    (id: string) => {
      navigateTo(`/project/${id}`);
    },
    [navigateTo]
  );

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
        <div onClick={() => navigateTo("/")} className={STYLES.navItem}>
          <FaHome size={20} className={STYLES.icon} />
          <span className={STYLES.text}>Home</span>
        </div>
        <div
          onClick={() => navigateTo("/conversation")}
          className={STYLES.navItem}
        >
          <FaProjectDiagram size={20} className={STYLES.icon} />
          <span className={STYLES.text}>Conversation</span>
        </div>
      </nav>

      <div className="mt-10">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Recent Projects
        </h3>
        <div className="space-y-1">
          <ProjectList
            data={data}
            loading={loading}
            error={error}
            onProjectClick={handleProjectClick}
          />
        </div>
      </div>
    </div>
  );
};
