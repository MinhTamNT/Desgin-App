import { gql, useQuery } from "@apollo/client";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { FaRegClock } from "react-icons/fa"; // Import an icon for recent activities
import CircularProgress from "@mui/material/CircularProgress"; // Loader for loading states
import { GET_ACTIVATE } from "../../utils/Activaty/Activaty";

export const Profile = () => {
  // Access currentUser from Redux store
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );

  // Query activity log data from GraphQL
  const { data, loading, error } = useQuery(GET_ACTIVATE);

  // Handle loading state for user activity data
  if (!currentUser || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress color="primary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center text-red-500">Error loading activities</div>
    );
  }

  // Destructure activity data from query response
  const activities = data?.getUserActivityLog || [];

  return (
    <div className="max-w-4xl mx-auto my-[20px] p-8 bg-white shadow-lg rounded-lg border border-gray-200">
      {/* User Profile Section */}
      <div className="flex items-center gap-8 mb-8 flex-col md:flex-row">
        <Avatar
          src={currentUser.picture || "/default-profile.png"}
          alt="Profile Picture"
          sx={{ width: 120, height: 120 }}
          className="rounded-full border-4 border-blue-500"
        />
        <div className="text-center md:text-left">
          <Typography
            variant="h4"
            component="h1"
            className="text-3xl font-extrabold text-gray-900"
          >
            {currentUser.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            className="text-lg text-gray-700"
          >
            {currentUser.email}
          </Typography>
        </div>
      </div>

      {/* Activity Status Section */}
      <div className="mb-8">
        <Typography
          variant="h6"
          component="h2"
          className="text-2xl font-semibold text-gray-800 mb-2"
        >
          Activity Status
        </Typography>
        <Typography
          className={`text-lg ${
            currentUser.sub ? "text-green-600" : "text-red-600"
          }`}
        >
          {currentUser.sub ? "Online" : "Offline"}
        </Typography>
      </div>

      {/* Recent Activities Section */}
      <div>
        <Typography
          variant="h6"
          component="h2"
          className="text-2xl font-semibold text-gray-800 mb-4"
        >
          Recent Activities
        </Typography>
        <ul className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity: any, index: any) => (
              <li
                key={activity.idactivityLogSchema}
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                }`}
              >
                <FaRegClock className="text-blue-500 w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-gray-700 text-lg font-medium">
                    {activity.action}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {activity.details}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No recent activities</li>
          )}
        </ul>
      </div>
    </div>
  );
};
