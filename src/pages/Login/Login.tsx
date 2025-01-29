import { GoogleLogin } from "@react-oauth/google";
import React from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setError, setUser } from "../../Redux/userSlice";
import { jwtDecode } from "jwt-decode";
import { User } from "../../lib/interface";
import { useMutation } from "@apollo/client";
import { ADD_USER } from "../../utils/User/User";

interface GoogleCredentialResponse {
  credential?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addNewUser] = useMutation(ADD_USER);
  const [, setCookie] = useCookies(["access_token"]);

  const getDeviceId = () => {
    const platform = navigator.platform;
    const browserName = navigator.appName;

    return `${platform}-${browserName}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  };

  const handleLoginSuccess = async (
    credentialResponse: GoogleCredentialResponse
  ) => {
    try {
      const token = credentialResponse?.credential;
      if (token) {
        await setCookie("access_token", token, {
          path: "/",
          expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
        });
        const newUser = jwtDecode<User>(token);
        dispatch(setUser(newUser));
        await addNewUser({
          variables: {
            idUser: newUser?.sub,
            name: newUser?.name,
            email: newUser?.email,
            tokenUser: token,
            expireAt: newUser?.iat.toString(),
            profilePicture: newUser?.picture,
            deviceId: getDeviceId(),
          },
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to handle login:", error);
      dispatch(setError());
    }
  };

  const handleLoginError = () => {
    console.log("Login Failed");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 to-blue-600">
      <header className="w-full py-6 bg-white shadow-2xl rounded-b-xl">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-5xl font-extrabold text-gray-800">Pixel App</h1>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            type="standard"
            size="large"
            shape="rectangular"
            logo_alignment="left"
            width="300"
            useOneTap
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center text-center py-16 px-6">
        <h2 className="text-6xl font-extrabold text-white mb-6 leading-tight animate__animated animate__fadeIn animate__delay-1s">
          Welcome to Pixel App
        </h2>
        <p className="text-lg text-white mb-8 max-w-3xl mx-auto animate__animated animate__fadeIn animate__delay-2s">
          Experience the best features and an intuitive interface. Sign in to
          explore more! Pixel App is an advanced platform with a modern design
          and user-friendly interface. We offer powerful tools to help you
          achieve your goals efficiently. With high-level security, you can use
          our app with confidence. Explore exceptional experiences and
          innovative features that we provide. Sign in with Google to get
          started and discover everything Pixel App has to offer!
        </p>
      </main>

      <footer className="w-full py-6 bg-white shadow-2xl rounded-t-xl mt-8">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-semibold mb-4 text-gray-800">
            Why Choose Us?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Pixel App provides an exceptional experience with state-of-the-art
            features and a user-friendly interface. Explore our features and see
            how we can help you achieve your goals.
          </p>
          <Link to="/" className="text-blue-600 hover:underline font-semibold">
            Learn More
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;
