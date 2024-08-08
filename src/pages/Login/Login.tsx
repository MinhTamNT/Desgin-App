import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError, setUser } from "../../Redux/userSlice";
import { jwtDecode } from "jwt-decode";
import { User } from "../../lib/interface";

const Login: React.FC = () => {
  const naigate = useNavigate();
  const dispatch = useDispatch();
  const [cookies, setCookie] = useCookies(["access_token"]);
  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse?.credential;
      if (token) {
        await setCookie("access_token", token, {
          path: "/",
        });
        dispatch(setUser(jwtDecode<User>(token)));
        naigate("/");
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      dispatch(setError());
    }
  };

  const handleLoginError = () => {
    console.log("Login Failed");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200">
      <div className="w-full max-w-md p-8 md:p-10 space-y-8 bg-white shadow-lg rounded-lg border border-gray-300">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">
          Login
        </h2>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              type="standard"
              size="large"
              shape="rectangular"
              logo_alignment="left"
              width="300"
              auto_select={true}
              useOneTap={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
