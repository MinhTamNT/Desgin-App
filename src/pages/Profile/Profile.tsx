import { useQuery } from "@apollo/client";
import Avatar from "@mui/material/Avatar";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { motion } from "framer-motion";
import {
  FaRegClock,
  FaRegBell,
  FaRegUser,
  FaRegEnvelope,
  FaCalendarAlt,
  FaRegCheckCircle,
} from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";
import { GET_ACTIVATE } from "../../utils/Activaty/Activaty";



interface ActivityLog {
  idactivityLogSchema: string;
  action: string;
  details: string;
  createdAt: string;
}

export const Profile = () => {
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );

  const { data, loading, error } = useQuery(GET_ACTIVATE);

  if (!currentUser || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Error loading activities</div>
    );
  }

  const activities = data?.getUserActivityLog || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden mb-8"
        >
          {/* Header */}
          <div className="relative">
            <div className="h-48 bg-blue-600 relative">
              <div className="absolute inset-0 bg-opacity-10"></div>
            </div>
            
            {/* Profile Info */}
            <div className="relative px-6 sm:px-12 pb-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-end -mt-24">
                <Avatar
                  src={currentUser.picture || "/default-profile.png"}
                  alt="Profile Picture"
                  sx={{ width: 150, height: 150 }}
                  className="ring-4 ring-white shadow-xl rounded-full border-4 border-white mb-4 lg:mb-0"
                />
                
                <div className="lg:ml-8 text-center lg:text-left flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentUser?.name || "Anonymous User"}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                    <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                      <FaRegEnvelope className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{currentUser.email}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center
                        ${currentUser.sub ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        `}
                      >
                        <span className={`w-2 h-2 rounded-full mr-2 ${currentUser.sub ? "bg-green-600" : "bg-red-600"}`}></span>
                        {currentUser.sub ? "Active" : "Inactive"}
                      </span>
                    </div>
                    
                    <div className="hidden md:flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
                      <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Joined {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                </div>
                

              </div>
            </div>
          </div>
          
          {/* Profile Stats */}
          <div className="px-6 py-6 border-t border-gray-100">
            <div className="flex flex-wrap justify-around text-center divide-x divide-gray-200">
              <div className="px-6 py-2">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.floor(Math.random() * 30) + 5}
                </div>
                <div className="text-sm text-gray-500 mt-1">Projects</div>
              </div>
              
              <div className="px-6 py-2">
                <div className="text-3xl font-bold text-blue-600">
                  {activities.length || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">Activities</div>
              </div>
              
              <div className="px-6 py-2">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.floor(Math.random() * 15) + 2}
                </div>
                <div className="text-sm text-gray-500 mt-1">Collaborators</div>
              </div>
            </div>
          </div>
          
          {/* Activity Header */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center">
            <FaRegClock className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
          </div>
        </motion.div>

        {/* Activities Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-8"
        >
          <div className="space-y-4">
            {activities && activities.length > 0 ? (
              activities.map((activity: ActivityLog) => (
                <motion.div
                  key={activity.idactivityLogSchema}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group hover:shadow-md transition-all duration-300 rounded-xl p-5 border border-gray-100 hover:border-blue-100"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaRegCheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                            {activity.action}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {activity.details}
                          </p>
                        </div>
                        <time className="text-sm text-gray-500 flex items-center whitespace-nowrap">
                          <FaRegBell className="w-3 h-3 mr-2 text-gray-400" />
                          {new Date(activity.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                <FaRegUser className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-700 font-medium text-lg">
                  No recent activities
                </p>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Your design activities and collaborations will appear here as you work on projects.
                </p>
                <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200">
                  Start a Project
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
