import { FaHome, FaProjectDiagram } from "react-icons/fa";
import { image } from "../assets/image/image";

const recentItems = [
  { id: "1", name: "Project Alpha" },
  { id: "2", name: "Project Beta" },
  { id: "3", name: "Project Gamma" },
];

export const Navbar = () => {
  const navigateTo = (path: string) => {
    // history.push(path);
  };

  return (
    <div className="hidden lg:flex flex-col w-64 p-6 bg-white text-black shadow-lg rounded-lg">
      <div className="flex items-center justify-center mb-8">
        <img src={image.logo} alt="logo-app" className="h-35 object-cover" />
      </div>
      <nav className="flex flex-col space-y-4">
        <div
          onClick={() => navigateTo("/home")}
          className="flex items-center shadow-md space-x-4 p-4 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors duration-300"
        >
          <FaHome size={24} className="text-gray-300" />
          <span className="font-medium">Home</span>
        </div>
        <div
          onClick={() => navigateTo("/projects")}
          className="flex items-center shadow-md space-x-4 p-4 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors duration-300"
        >
          <FaProjectDiagram size={24} className="text-gray-300" />
          <span className="font-medium">Conversation</span>
        </div>
      </nav>

      {/* Recent Items Section */}
      <div className="mt-8">
        <h3 className="text-gray-400 font-semibold mb-3">Recent Items</h3>
        <ul className="space-y-2">
          {recentItems.map((item) => (
            <li key={item.id}>
              <div
                onClick={() => navigateTo(`/project/${item.id}`)}
                className="flex items-center shadow-md space-x-4 p-4 rounded-lg cursor-pointer hover:bg-gray-400 transition-colors duration-300"
              >
                <FaProjectDiagram size={24} className="text-gray-300" />
                <span className="font-medium">{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
