import { useQuery } from "@apollo/client";
import Avatar from "@mui/material/Avatar";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import {
  FaRegClock,
  FaRegBell,
  FaRegUser,
  FaRegEnvelope,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="relative px-6 sm:px-12 pb-8">
            <div className="flex flex-col sm:flex-row items-center -mt-24 mb-8">
              <Avatar
                src={currentUser.picture || "/default-profile.png"}
                alt="Profile Picture"
                sx={{ width: 150, height: 150 }}
                className="ring-4 ring-white shadow-xl rounded-full border-4 border-white"
              />
              <div className="mt-6 sm:mt-0 sm:ml-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentUser?.name || "Anonymous User"}
                </h1>
                <div className="flex items-center justify-center sm:justify-start mt-2 space-x-4">
                  <div className="flex items-center text-gray-600">
                    <FaRegEnvelope className="w-4 h-4 mr-2" />
                    <span>{currentUser.email}</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        currentUser.sub
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                      flex items-center`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 
                        ${currentUser.sub ? "bg-green-500" : "bg-red-500"}`}
                      ></span>
                      {currentUser.sub ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center mb-8">
            <FaRegClock className="text-blue-600 w-6 h-6 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Activities
            </h2>
          </div>

          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity: ActivityLog) => (
                <div
                  key={activity.idactivityLogSchema}
                  className="group bg-gray-50 hover:bg-blue-50 transition-all duration-300 
                    rounded-xl p-5 border border-gray-100 hover:border-blue-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                        {activity.action}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {activity.details}
                      </p>
                    </div>
                    <time className="text-sm text-gray-500 mt-2 sm:mt-0 flex items-center">
                      <FaRegBell className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(activity.createdAt).toLocaleString()}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FaRegUser className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">
                  No recent activities
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Your activities will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
