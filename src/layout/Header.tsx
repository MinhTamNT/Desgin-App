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
import { toast } from "react-toastify";
import {toast as ToastHost , Toaster} from "react-hot-toast"
import { GET_PROJECT } from "../utils/Project/Project";
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
        console.log(newNotification)
        console.log("New Notification:", newNotification);
        if (
          newNotification.userRequest.map(
            (user: { idUser: string }) => user.idUser === currentUser?.sub
          )
        ) {
         
          ToastHost.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white pointer-events-auto flex border-l-4 border-black`}
              style={{
                borderRadius: '0',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                opacity: t.visible ? 1 : 0
              }}
            >
              {/* Left accent bar */}
              <div className="w-1 bg-gradient-to-b from-black to-gray-700 h-full absolute left-0 top-0" />
              
              <div className="flex-1 w-0 p-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gray-100 p-2 rounded-none flex items-center justify-center" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                    {newNotification.type === "INVITATION" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold text-black uppercase tracking-wider letter-spacing-1">
                        New Notification
                      </h3>
                      <span className="text-xs text-gray-400">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                      {newNotification.message}
                    </p>
                    
                    {newNotification.type === "INVITATION" && (
                      <div className="mt-4 flex space-x-3">
                        <button 
                          onClick={() => handleAcceptInvite(newNotification.invitation_idInvitation)}
                          className="px-4 py-1.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors focus:outline-none"
                          style={{ letterSpacing: '0.05em' }}
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleRejectInvite(newNotification.invitation_idInvitation)}
                          className="px-4 py-1.5 bg-white text-black border border-black text-xs font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors focus:outline-none"
                          style={{ letterSpacing: '0.05em' }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-100">
                <button
                  onClick={() => ToastHost.dismiss(t.id)}
                  className="w-full border border-transparent p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-black hover:bg-gray-50 transition-all duration-200 focus:outline-none"
                  aria-label="Close notification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
          setNotifications((prev) => [...prev, newNotification]);
        }
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    },
  });

  const [updateInvite] = useMutation(UPDATE_INVITE, {
    refetchQueries: [
      { query: GET_PROJECT, variables: { pageIndex: 1, pageSize: 6, nameProject: "" } }
    ],
    awaitRefetchQueries: true
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

  const handleAcceptInvite = async (idInvite: string) => {
    try {
      await updateInvite({
        variables: {
          invitationIdInvitation: idInvite,
          status: "ACCEPTED",
        },
      });
      handleClose(); // Đóng menu thông báo sau khi chấp nhận
      toast.success("Bạn đã được thêm vào dự án!");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra khi chấp nhận lời mời");
    }
  };
  
  const handleRejectInvite = async (idInvite: string) => {
    try {
      await updateInvite({
        variables: {
          invitationIdInvitation: idInvite,
          status: "REJECTED",
        },
      });
      handleClose(); // Đóng menu thông báo sau khi từ chối
      toast.info("Đã từ chối lời mời dự án");
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra khi từ chối lời mời");
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
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
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
          className="relative hover:bg-blue-50 transition-colors duration-200 rounded-full"
          size="large"
        >
          <Badge
            badgeContent={notificationCount}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.75rem",
                height: "20px",
                minWidth: "20px",
                padding: "0 6px",
                backgroundColor: "#0ea5e9",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              },
            }}
          >
            <NotificationsIcon className="text-teal-600" />
          </Badge>
        </IconButton>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={openNotifications}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: "420px",
              maxHeight: "540px",
              overflowY: "auto",
              mt: 1.5,
              borderRadius: "12px",
              boxShadow:
                "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)",
              border: "1px solid rgba(229, 231, 235, 0.5)",
              "& .MuiList-root": {
                padding: "0",
              },
            },
          }}
        >
          {/* Notification Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-5 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <Typography variant="h6" className="font-semibold text-white">
                Notifications
              </Typography>
              {notificationCount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                  {notificationCount} new
                </div>
              )}
            </div>
          </div>
          
          {notificationCount > 0 ? (
            <>
              <div className="py-1 max-h-[400px] overflow-auto">
                {notifications.map((notification: Notification) => (
                  <MenuItem
                    key={notification?.idNotification}
                    onClick={handleClose}
                    className="px-0 py-1 hover:bg-blue-50/50 transition-colors duration-200"
                    sx={{ borderRadius: '8px', margin: '0 8px' }}
                  >
                    <div className="flex items-start gap-4 w-full p-3">
                      <div className="bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="font-medium">
                          {notification?.type === "INVITED" ? "Inv" : "New"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <Typography
                          variant="body2"
                          className="text-gray-800 font-medium mb-1 line-clamp-2"
                        >
                          {notification?.message}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        
                        {!notification?.is_read && notification?.type === "INVITED" && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptInvite(notification?.invitation_idInvitation);
                              }}
                              className="px-4 py-1.5 text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-teal-500 
                                   hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-sm hover:shadow"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectInvite(notification?.invitation_idInvitation);
                              }}
                              className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-gray-100 
                                   hover:bg-gray-200 transition-colors duration-200"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {!notification?.is_read && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </MenuItem>
                ))}
              </div>
              
              {/* Footer with Load More */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={loadMoreNotifications}
                  className="w-full py-2.5 text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors flex items-center justify-center bg-transparent hover:bg-blue-50/50 rounded-md"
                >
                  Load more
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-12 px-4 hover:bg-transparent">
              <div className="relative bg-gradient-to-b from-blue-50 to-teal-50 p-4 rounded-2xl mb-5 w-40 h-40 flex items-center justify-center">
                <img
                  src={DEFAULT_IMAGE_URL}
                  alt="No notifications"
                  className="object-contain w-32 h-32 rounded-xl transform transition-transform hover:scale-105 duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-50/50 rounded-2xl"></div>
              </div>
              <Typography
                className="text-gray-800 font-semibold text-lg"
                sx={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  letterSpacing: "0.025em",
                }}
              >
                All caught up!
              </Typography>
              <Typography className="text-gray-500 text-sm mt-1 text-center max-w-xs">
                We'll notify you when new invitations or updates arrive
              </Typography>
            </div>
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
