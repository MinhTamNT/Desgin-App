import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";

const dummyProjects = [
  {
    id: "1",
    name: "Modern Web Design",
    image:
      "https://cdn.dribbble.com/userupload/14512098/file/original-6570865dd7c56b1961b54c5fa599d3b0.png?resize=1024x768",
  },

  {
    id: "2",
    name: "App Design Mockup",
    image:
      "https://cdn.dribbble.com/userupload/14584755/file/original-36ef3e6dd5d9c5f68df5039ed368f50c.png?resize=1024x768",
  },
  {
    id: "3",
    name: "Creative Workspace Setup",
    image:
      "https://cdn.dribbble.com/userupload/13028668/file/original-a9166bf7c9ca9544813928b26880462c.png?resize=1024x768",
  },
];

export const Home = () => {
  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const projects = user?.projects || dummyProjects;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative text-white py-24 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover"
          src="https://cdn.prod.website-files.com/62bac7754ea6d7967db80305/65d6f41364044a20584b6dea_CZ_Main_Compress-transcode.mp4"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Welcome Back, {user?.name || "Creative User"}!
          </h1>
          <p className="text-xl mb-8">
            Explore your latest design projects and elevate your creative
            journey with our cutting-edge tools.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-12">
            Your Creative Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
              >
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-64 object-cover rounded-lg mb-6 transition-transform duration-300 group-hover:scale-105"
                />
                <h3 className="text-xl font-semibold mb-4">{project.name}</h3>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-60 rounded-lg">
                  <button className="bg-teal-600 text-white py-2 px-4 rounded-full shadow-lg hover:bg-teal-700 transition-colors duration-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
