import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../Redux/store";
import Cookies from "js-cookie";
import { JwtPayload, jwtDecode } from "jwt-decode";
import useGraphQLSubscription from "../hook/useGraphQLSubscription";
import ErrorBoundary from "../components/Error/ErrorBoundary";

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return true;
  }
};

export const ProtectedRoute = () => {
  const user = useSelector((state: RootState) => state.user?.user?.currentUser);

  const token = Cookies.get("access_token");
  useGraphQLSubscription(token as string);

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/auth" />;
  }

  if (typeof user === "undefined") {
    return <div>Loading.....</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Outlet />
    </ErrorBoundary>
  );
};
