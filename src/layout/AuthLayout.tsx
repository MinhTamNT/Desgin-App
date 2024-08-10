import React from "react";
import { Provider } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../Redux/store";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Header } from "./Header";
import { ApolloProvider } from "@apollo/client";
import { createApolloClient } from "../config/apolloClient";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_CLIENT_ID;

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/auth";
  const client = createApolloClient();

  return (
    <GoogleOAuthProvider clientId={clientId || ""}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ApolloProvider client={client}>
            <main className="h-full">
              {/* Conditionally render Sidebar, Navbar, and Header based on the route */}
              {!isLoginPage && (
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
            </main>
          </ApolloProvider>
        </PersistGate>
      </Provider>
    </GoogleOAuthProvider>
  );
};
