import React from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
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
import { RiEdit2Line, RiDeleteBinLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { fetchUserRoleSuccess } from "../../Redux/roleSlice";

export const Home: React.FC = () => {
  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const { data, loading, error } = useQuery<{ getUserProjects: Project[] }>(
    GET_PROJECT
  );
  const [deleteProject] = useMutation(DELETED_PROJECT);
  const [updateLastAccess] = useMutation(UPDATE_LASTETS_ACCESS);
  const client = useApolloClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleDelete = async (idProject: string) => {
    try {
      await deleteProject({
        variables: { projectId: idProject },
        refetchQueries: [{ query: GET_PROJECT }],
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (idProject: string) => {
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
        (member: any) => member.User[0].idUser === user?.sub
      );

      if (currentUserRole) {
        dispatch(
          fetchUserRoleSuccess({
            access: currentUserRole.access,
            is_host_user: currentUserRole.is_host_user,
          })
        );
      } else {
        console.log("Current user is not part of this project.");
      }
      navigate(`/project/${idProject}`);
    } catch (error) {
      console.log(error);
    }
  };

  const projects = (data?.getUserProjects || []).map((project) => ({
    ...project,
    image: dummyImages[Math.floor(Math.random() * dummyImages.length)],
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white py-28">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover brightness-75"
          src="https://cdn.prod.website-files.com/62bac7754ea6d7967db80305/65d6f41364044a20584b6dea_CZ_Main_Compress-transcode.mp4"
        />
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Welcome Back, {user?.name || "Creative User"}!
          </h1>
          <p className="text-lg mb-8 md:mb-12">
            Explore your projects and enhance your creative journey.
          </p>
          <button className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-3 px-8 rounded-full font-medium shadow-md hover:shadow-lg hover:scale-105 transform transition duration-300">
            Get Started
          </button>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Your Creative Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {projects.map((project) => (
              <div
                key={project.idProject}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-60 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {project.description || "No description available"}
                  </p>
                  <div className="flex justify-between items-center space-x-4">
                    <button
                      onClick={() => handleEdit(project.idProject)}
                      className="bg-teal-500 text-white py-2 px-4 rounded-full flex items-center shadow-md hover:bg-teal-600 transition-colors duration-300"
                    >
                      Edit
                      <RiEdit2Line className="ml-2" size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.idProject)}
                      className="bg-red-500 text-white py-2 px-4 rounded-full flex items-center shadow-md hover:bg-red-600 transition-colors duration-300"
                    >
                      Delete
                      <RiDeleteBinLine className="ml-2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
