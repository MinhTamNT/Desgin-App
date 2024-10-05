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

const DEFAULT_IMAGE_URL =
  "https://cdn.dribbble.com/userupload/15166587/file/original-cf8f815408f5908c3c2fe4b24d35af18.png?resize=1024x768";

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const currentUser = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );

  useQuery(GET_NOTIFICATION, {
    onCompleted: (data) => {
      setNotifications(
        data?.getNotificationsByUserId.filter(
          (notification: any) => !notification.is_read
        ) || []
      );
    },
  });

  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data) {
        const newNotification = subscriptionData.data.notificationCreated;
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
    <header className="flex items-center justify-between p-4 shadow-md bg-white">
      {/* Left - Search */}
      <div className="hidden lg:flex flex-1 rounded-lg">
        <Box className="relative w-full max-w-lg">
          <FaSearch className="absolute top-3 left-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 p-2 rounded-lg border border-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </Box>
      </div>

      {/* Right - Icons */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <IconButton
          onClick={handleNotificationClick}
          size="small"
          color="inherit"
        >
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationAnchorEl}
          open={openNotifications}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: "700px",
              maxHeight: "400px",
              overflowY: "auto",
            },
          }}
        >
          {notificationCount > 0 ? (
            notifications.map((notification: any) => (
              <MenuItem
                key={notification?.idNotification}
                onClick={handleClose}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                <Box className="bg-blue-200 rounded-full w-8 h-8 flex items-center justify-center text-blue-600">
                  New
                </Box>
                <Typography variant="body2">{notification?.message}</Typography>
                {!notification?.is_read &&
                  notification?.type === "INIVITED" && (
                    <Box className="ml-auto flex gap-2">
                      <button
                        className="bg-green-300 p-1 rounded-md uppercase text-gray-800 hover:bg-green-400 transition"
                        onClick={() =>
                          handleAcceptInvite(
                            notification?.invitation_idInvitation
                          )
                        }
                      >
                        Accept
                      </button>
                      <button className="bg-red-300 p-1 rounded-md uppercase text-white hover:bg-red-400 transition">
                        Reject
                      </button>
                    </Box>
                  )}
              </MenuItem>
            ))
          ) : (
            <MenuItem
              onClick={handleClose}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                transition: "background-color 0.3s",
              }}
            >
              <img
                src={DEFAULT_IMAGE_URL}
                alt="No new notifications"
                className="w-16 h-16 object-cover"
              />
              <Typography variant="body2">No new notifications</Typography>
            </MenuItem>
          )}
        </Menu>

        {/* Profile and Settings */}
        <IconButton onClick={handleClick} size="small" color="inherit">
          <Avatar
            src={user?.picture}
            alt="Profile Picture"
            sx={{ width: 40, height: 40 }}
          />
          <ArrowDropDown />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: "200px",
            },
          }}
        >
          <MenuItem
            onClick={() => navigate("/profile")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <FaUser size={18} />
            <Typography variant="body2">Profile</Typography>
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              borderRadius: "4px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            }}
          >
            <FaSignOutAlt size={18} />
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};
