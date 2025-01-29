import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../Redux/store";
import Cookies from "js-cookie";
import useGraphQLSubscription from "../hook/useGraphQLSubscription";
import ErrorBoundary from "../components/Error/ErrorBoundary";

export const ProtectedRoute = () => {
  const user = useSelector((state: RootState) => state.user?.user?.currentUser);

  const token = Cookies.get("access_token");
  useGraphQLSubscription(token as string);

  if (typeof user === "undefined") {
    return <div>Loading...</div>;
  }

  if (!user || !token) {
    return <Navigate to="/auth" />;
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Outlet />
    </ErrorBoundary>
  );
};
