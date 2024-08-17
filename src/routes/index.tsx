import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layout/AuthLayout";
import { Home } from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import { Project } from "../pages/Project/Project";

export default createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        element: <Login />,
        path: "/auth/",
      },
      {
        element: <Home />,
        path: "/",
      },
      {
        element: <Project />,
        path: `/project/:idProject`,
      },
    ],
  },
]);
