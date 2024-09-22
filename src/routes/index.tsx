import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layout/AuthLayout";
import { Home } from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import { Project } from "../pages/Project/Project";
import { ProtectedRoute } from "./ProtectedRoute";
import { Conversation } from "../pages/Conversation/Conversation";
import { Message } from "../pages/Conversation/Message";
import { Profile } from "../pages/Profile/Profile";

export default createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        element: <Login />,
        path: "/auth/",
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <Home />,
            path: "/",
          },
          {
            element: <Project />,
            path: `/project/:idProject`,
          },
          {
            element: <Profile />,
            path: `/profile`,
          },
          {
            element: <Conversation />,
            path: `/conversation`,
            children: [
              {
                element: <Message />,
                path: `/conversation/:conversationId`,
              },
            ],
          },
        ],
      },
    ],
  },
]);
