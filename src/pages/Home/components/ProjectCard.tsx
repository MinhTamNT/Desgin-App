import {
  RiEdit2Line,
  RiDeleteBinLine,
  RiTimeLine,
  RiUserLine,
} from "react-icons/ri";
import { Project } from "../../../lib/interface";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const userStatus = useSelector((state: RootState) => 
    state.userStatus.statuses[project.userId] || "offline"
  );

  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-[16/9]">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover rounded-t-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-t-xl">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center text-white space-x-2">
              <RiTimeLine className="w-4 h-4" />
              <span className="text-sm">{lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
              {project.name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm">
              <RiUserLine className="mr-1" />
              <span className="flex items-center">
                {project.is_host_user ? "Owner" : "Member"}
                <span className={`ml-2 w-2 h-2 rounded-full ${
                  userStatus === "online" ? "bg-green-500" : "bg-gray-400"
                }`} />
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.is_host_user
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {project.is_host_user ? "Owner" : "Member"}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-6 line-clamp-2">
          {project.description || "No description available"}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(project.idProject)}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <RiEdit2Line className="mr-2" />
            Edit
          </button>

          <button
            onClick={() => onDelete(project.idProject)}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <RiDeleteBinLine className="mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
