import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { Provider } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../Redux/store";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Header } from "./Header";

const clientId = import.meta.env.VITE_CLIENT_ID;

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/auth";

  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <main className="h-full">
            {!isLoginPage && <Sidebar />}
            <div className="pl-[60px] h-full">
              <div className="flex gap-x-1 h-full min-h-screen">
                <Navbar />
                <div className="h-full flex-1">
                  <Header />
                  <Outlet />
                </div>
              </div>
            </div>
          </main>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
};
