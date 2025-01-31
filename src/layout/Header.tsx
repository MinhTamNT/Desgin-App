import React, { useState } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  Typography,
} from "@mui/material";
import {
  ArrowDropDown,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { FaUser, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { RootState, persistor } from "../Redux/store";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  GET_NOTIFICATION,
  NOTIFICATION_SUBSCRIPTION,
} from "../utils/Notify/Notify";
import { UPDATE_INVITE } from "../utils/Inivitation/inivitaton";
import { clearUser } from "../Redux/userSlice";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
interface Notification {
  idNotification: string;
  message: string;
  is_read: boolean;
  type: string;
  invitation_idInvitation: string;
  userRequest: Array<{ idUser: string }>;
}

const DEFAULT_IMAGE_URL =
  "https://cdn.dribbble.com/userupload/14352886/file/original-d5196ebfc7a26cce14d6929997887ba0.jpg?resize=2048x1536&vertical=center";

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const navigate = useNavigate();
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  const userStatus = useSelector(
    (state: RootState) => state.userStatus.statuses
  );
  const loadMoreNotifications = () => {
    setPageIndex((prevPageIndex) => prevPageIndex + 1);
  };

  useQuery(GET_NOTIFICATION, {
    variables: { pageIndex, pageSize },
    onCompleted: (data) => {
      const notifications = data?.getNotificationsByUserId?.notifications || [];
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        ...notifications.filter(
          (notification: Notification) => !notification.is_read
        ),
      ]);
    },
  });

  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data) {
        const newNotification = subscriptionData.data.notificationCreated;
        console.log("New Notification:", newNotification);
        if (
          newNotification.userRequest.map(
            (user: { idUser: string }) => user.idUser === currentUser?.sub
          )
        ) {
          setNotifications((prev) => [...prev, newNotification]);
        }
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });

  const [updateInvite] = useMutation(UPDATE_INVITE);
  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );

  const open = Boolean(anchorEl);
  const openNotifications = Boolean(notificationAnchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const notificationCount = notifications.length;

  const handleAcceptInvite = async (idInvite: string) => {
    try {
      await updateInvite({
        variables: {
          invitationIdInvitation: idInvite,
          status: "ACCEPTED",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cookie = new Cookies();
  const dispatch = useDispatch();
  const handleLogout = () => {
    cookie.remove("access_token");
    dispatch(clearUser());
    persistor.purge().then(() => {
      navigate("/auth");
    });
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* Search Bar */}
      <div className="hidden lg:flex flex-1 max-w-2xl mr-8">
        <Box className="relative w-full">
          <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 
                     placeholder-gray-500 text-sm transition-all duration-200
                     focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
        </Box>
      </div>

      <div className="flex items-center space-x-6">
        <IconButton
          onClick={handleNotificationClick}
          className="relative hover:bg-gray-100 transition-colors duration-200"
          size="large"
        >
          <Badge
            badgeContent={notificationCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.75rem",
                height: "20px",
                minWidth: "20px",
                padding: "0 6px",
              },
            }}
          >
            <NotificationsIcon className="text-gray-700" />
          </Badge>
        </IconButton>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={openNotifications}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: "400px",
              maxHeight: "500px",
              overflowY: "auto",
              mt: 1.5,
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              "& .MuiList-root": {
                padding: "8px",
              },
            },
          }}
        >
          {notificationCount > 0 ? (
            notifications
              .map((notification: Notification) => (
                <MenuItem
                  key={notification?.idNotification}
                  onClick={handleClose}
                  className=""
                >
                  <div className="flex items-center gap-4 w-full p-2">
                    <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm font-medium">
                        New
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="body2"
                        className="text-gray-900 line-clamp-2"
                      >
                        {notification?.message}
                      </Typography>
                      {!notification?.is_read &&
                        notification?.type === "INVITED" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                handleAcceptInvite(
                                  notification?.invitation_idInvitation
                                )
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-md text-green-700 bg-green-100 
                                   hover:bg-green-200 transition-colors duration-200"
                            >
                              Accept
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-100 
                                   hover:bg-red-200 transition-colors duration-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </MenuItem>
              ))
              .concat(
                <MenuItem
                  onClick={loadMoreNotifications}
                  className="flex justify-center py-2 hover:bg-gray-50"
                  key="load-more"
                >
                  <Typography variant="body2" className="text-blue-600">
                    Load More
                  </Typography>
                </MenuItem>
              )
          ) : (
            <MenuItem className="flex flex-col items-center py-10 hover:bg-transparent">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <img
                    src={DEFAULT_IMAGE_URL}
                    alt="No notifications"
                    className=" object-contain mb-4 rounded-xl transform transition-transform hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 rounded-xl"></div>
                </div>
                <Typography
                  className="text-gray-600 font-medium text-lg animate-fade-in"
                  sx={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    letterSpacing: "0.025em",
                  }}
                >
                  No new notifications
                </Typography>
                <Typography className="text-gray-400 text-sm mt-1">
                  We'll notify you when something arrives
                </Typography>
              </div>
            </MenuItem>
          )}
        </Menu>

        {/* Profile Section */}
        <div className="relative">
          <IconButton
            onClick={handleClick}
            className="hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="relative">
              <Avatar
                src={user?.picture}
                alt="Profile"
                sx={{
                  width: 40,
                  height: 40,
                  border: "2px solid white",
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                }}
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white
                          ${
                            userStatus?.status === "online"
                              ? "bg-green-500"
                              : userStatus?.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                          }`}
              />
            </div>
            <ArrowDropDown className="text-gray-600" />
          </IconButton>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                width: "240px",
                mt: 1.5,
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                "& .MuiList-root": {
                  padding: "8px",
                },
              },
            }}
          >
            {/* Status Indicator */}
            <MenuItem
              className="rounded-lg mb-1"
              sx={{ pointerEvents: "none" }}
            >
              <div className="flex items-center gap-2 py-1">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    userStatus?.status === "online"
                      ? "bg-green-500"
                      : userStatus?.status === "away"
                      ? "bg-yellow-500"
                      : "bg-gray-400"
                  }`}
                />
                <Typography
                  variant="body2"
                  className="capitalize text-gray-700"
                >
                  {userStatus?.status}
                </Typography>
              </div>
            </MenuItem>

            {/* Profile Link */}
            <MenuItem
              onClick={() => navigate("/profile")}
              className="rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 py-1">
                <FaUser className="text-gray-600" size={16} />
                <Typography variant="body2" className="text-gray-700">
                  Profile
                </Typography>
              </div>
            </MenuItem>

            {/* Logout Button */}
            <MenuItem
              onClick={handleLogout}
              className="rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 py-1">
                <FaSignOutAlt className="text-gray-600" size={16} />
                <Typography variant="body2" className="text-gray-700">
                  Logout
                </Typography>
              </div>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
};
