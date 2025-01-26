import React from "react";
import { Project } from "../../lib/interface";

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectProject,
}) => {
  const capitalizeFirstLetter = (string: string) => {
    return string.substring(0, 1);
  };
  return (
    <div className="p-4">
      <ul className="space-y-2">
        {projects.map((project) => (
          <li
            key={project.idProject}
            className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200"
            onClick={() => onSelectProject(project.idProject)}
          >
            {capitalizeFirstLetter(project.name)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
