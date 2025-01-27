import { ApolloProvider } from "@apollo/client";
import { LiveblocksProvider } from "@liveblocks/react/suspense";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { Provider } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { createApolloClient } from "../config/apolloClient";
import { persistor, store } from "../Redux/store";
import { Header } from "./Header";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import Room from "../components/Room/Room";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const clientId = import.meta.env.VITE_CLIENT_ID;
const publicKey = import.meta.env.VITE_LIVE_BLOCK;

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/auth";
  const isProjectPage = location.pathname.startsWith("/project/");

  const projectPath = isProjectPage
    ? location.pathname.substring("/project/".length)
    : "home-room";
  const client = createApolloClient();

  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <LiveblocksProvider publicApiKey={publicKey}>
        <Room idRoom={projectPath}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <ApolloProvider client={client}>
                <ToastContainer position="top-center" />
                <main
                  className={`h-full ${
                    isProjectPage ? "bg-project-background" : ""
                  }`}
                >
                  {!isLoginPage && !isProjectPage && (
                    <>
                      <Sidebar />
                      <div className="pl-[60px] h-full">
                        <div className="flex gap-x-1 h-full min-h-screen">
                          <Navbar />
                          <div className="h-full flex-1">
                            <Header />
                            <Outlet />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {isLoginPage && <Outlet />}
                  {isProjectPage && (
                    <div className="project-page-content">
                      <Outlet />
                    </div>
                  )}
                </main>
              </ApolloProvider>
            </PersistGate>
          </Provider>
        </Room>
      </LiveblocksProvider>
    </GoogleOAuthProvider>
  );
};
