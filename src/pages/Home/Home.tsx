import React, { useMemo, useCallback, useState } from "react";
import {
  useQuery,
  useMutation,
  useApolloClient,
  useSubscription,
} from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { Project } from "../../lib/interface";
import {
  GET_PROJECT,
  DELETED_PROJECT,
  UPDATE_LASTETS_ACCESS,
  GET_MEMEBER_IN_PROJECT,
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

  const {
    data: ProjectList,
    loading,
    error,
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

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error.message} />;

  const handleNextPage = () => {
    alert("Next Page");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <HeroSection userName={user?.name} />

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Your Creative Projects
            </h2>
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Explore and manage your ongoing projects with ease
            </p>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <img
                src={image.first}
                alt="No projects"
                className="mx-auto mb-6"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Projects Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start creating your first project today
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200">
                Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {paginatedProjects.map((project) => (
                <ProjectCard
                  key={project.idProject}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {totalRow > 20 && (
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousPage}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6 rounded-lg bg-blue-50">
              <h4 className="text-4xl font-bold text-blue-600 mb-2">
                {projects.length}
              </h4>
              <p className="text-gray-600">Total Projects</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-green-50">
              <h4 className="text-4xl font-bold text-green-600 mb-2">
                {projects.filter((p) => p.is_host_user).length}
              </h4>
              <p className="text-gray-600">Owned Projects</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-purple-50">
              <h4 className="text-4xl font-bold text-purple-600 mb-2">
                {projects.filter((p) => !p.is_host_user).length}
              </h4>
              <p className="text-gray-600">Shared Projects</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-orange-50">
              <h4 className="text-4xl font-bold text-orange-600 mb-2">
                {
                  projects.filter(
                    (p) =>
                      new Date(p.updatedAt) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </h4>
              <p className="text-gray-600">Active This Week</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
