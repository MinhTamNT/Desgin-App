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
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  GET_NOTIFICATION,
  NOTIFICATION_SUBSCRIPTION,
} from "../utils/Notify/Notify";
import { UPDATE_INVITE } from "../utils/Inivitation/inivitaton";

const DEFAULT_IMAGE_URL =
  "https://cdn.dribbble.com/userupload/15166587/file/original-cf8f815408f5908c3c2fe4b24d35af18.png?resize=1024x768";

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
        if (!newNotification.is_read) {
          setNotifications((prevNotifications) => [
            ...prevNotifications,
            newNotification,
          ]);
        }
      }
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

  const handlerAccpetInivite = async (idInivite: string) => {
    try {
      await updateInvite({
        variables: {
          invitationIdInvitation: idInivite,
          status: "ACCEPTED",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 shadow-md bg-white">
      <div className="hidden lg:flex flex-1 rounded-lg">
        <Box className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 rounded-lg border border-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </Box>
      </div>
      <div className="flex items-center space-x-4">
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
              width: "550px",
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
                          handlerAccpetInivite(
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
            <FaUser size={18} />
            <Typography variant="body2">Profile</Typography>
          </MenuItem>
          <MenuItem
            onClick={handleClose}
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
            <FaCog size={18} />
            <Typography variant="body2">Settings</Typography>
          </MenuItem>
          <MenuItem
            onClick={handleClose}
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
