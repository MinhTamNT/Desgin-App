import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "../../Redux/store";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../../Redux/userSlice";

export const Profile = () => {
  const currentUser = useSelector(
    (state: RootState) => state.user.user.currentUser
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cookie = new Cookies();
  const handlerLogout = () => {
    cookie.remove("access_token");
    dispatch(clearUser());
    persistor.purge().then(() => {
      console.log("User has been logged out and persisted storage cleared.");
      navigate("/auth");
    });
  };

  return (
    <div className=" min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <img
            src={currentUser?.picture || "/default-avatar.png"}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />
        </div>

        {/* User Information */}
        <div className="text-center mt-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {currentUser?.name || "User Name"}
          </h2>
          <p className="text-gray-500">
            {currentUser?.email || "user@example.com"}
          </p>
        </div>

        {/* Profile Details */}
        <div className="mt-6 text-center text-gray-700">
          <p>
            <strong>Username:</strong> {currentUser?.name || "N/A"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition duration-200 shadow-md"
            onClick={handlerLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
