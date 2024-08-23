import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../Redux/store";

export const ProtectedRoute = () => {
  const user = useSelector(
    (state: RootState) => state?.user?.user?.currentUser
  );
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <Outlet />;
};
