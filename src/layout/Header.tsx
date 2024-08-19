import React, { useState } from "react";
import { Avatar, IconButton, Menu, MenuItem, Badge } from "@mui/material";
import {
  ArrowDropDown,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa"; // Icons from react-icons
import { useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { useQuery, useSubscription } from "@apollo/client";
import {
  GET_NOTIFICATION,
  NOTIFICATION_SUBSCRIPTION,
} from "../utils/Notify/Notify";

const DEFAULT_IMAGE_URL =
  "https://cdn.dribbble.com/userupload/15166587/file/original-cf8f815408f5908c3c2fe4b24d35af18.png?resize=1024x768";

export const Header = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useQuery(GET_NOTIFICATION, {
    onCompleted: (data) => {
      setNotifications(data?.getNotificationsByUserId || []);
    },
  });
  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          subscriptionData.data.notificationCreated,
        ]);
      }
    },
  });
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

  return (
    <header className="flex items-center justify-between p-5 shadow-lg bg-white">
      <div className="flex-1 hidden lg:flex lg:flex-1 rounded-lg">
        <div className="w-full relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full max-w-[516px] p-2 rounded-lg border border-gray-300 placeholder-gray-600"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <IconButton
          onClick={handleNotificationClick}
          className="relative flex items-center"
          size="small"
        >
          <Badge
            badgeContent={notificationCount}
            color="secondary"
            className="text-gray-600"
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationAnchorEl}
          open={openNotifications}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: "400px",
              maxHeight: "400px",
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
                }}
              >
                <div className="bg-blue-200 rounded-full w-8 h-8 flex items-center justify-center text-blue-600">
                  New
                </div>
                {notification?.message}
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
                className="w-50 h-50 object-cover"
              />
              <p>No new notifications</p>
            </MenuItem>
          )}
        </Menu>

        <IconButton
          onClick={handleClick}
          className="flex items-center space-x-2"
          size="small"
        >
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
            }}
          >
            <FaUser size={18} />
            Profile
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
            Settings
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
            Logout
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};
