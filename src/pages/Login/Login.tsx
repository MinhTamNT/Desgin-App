import { GoogleLogin } from "@react-oauth/google";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setError, setUser } from "../../Redux/userSlice";
import { jwtDecode } from "jwt-decode";
import { User } from "../../lib/interface";
import { useMutation } from "@apollo/client";
import { ADD_USER } from "../../utils/User/User";
import { FaGoogle, FaMagic, FaArrowRight, FaLock, FaRegEye } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";

interface GoogleCredentialResponse {
  credential?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addNewUser] = useMutation(ADD_USER);
  const [, setCookie] = useCookies(["access_token"]);
  const [currentYear] = useState(new Date().getFullYear());
  const [hoverFeatures, setHoverFeatures] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Subtle background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      document.documentElement.style.setProperty('--mouse-x', x.toString());
      document.documentElement.style.setProperty('--mouse-y', y.toString());
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      setIsLoading(true);
      const token = credentialResponse?.credential;
      if (token) {
        await setCookie("access_token", token, {
          path: "/",
          expires: new Date(Date.now() + 60 * 60 * 24 * 1000),
        });
        const newUser = jwtDecode<User>(token);
        dispatch(setUser(newUser));

        // Add user to the backend
        await addNewUser({
          variables: {
            idUser: newUser?.sub,
            name: newUser?.name,
            email: newUser?.email,
            tokenUser: token,
            expireAt: newUser?.iat.toString(),
            profilePicture: newUser?.picture ,
            deviceId: getDeviceId(),
          },
        });

        navigate("/");
      }
    } catch (error) {
      console.error("Failed to handle login:", error);
      toast.error("Xảy ra lỗi trong quá trình đăng nhập")
      dispatch(setError()); // Handle error by dispatching an error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = () => {
    console.log("Login Failed");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" 
         style={{
           '--mouse-x': '0.5',
           '--mouse-y': '0.5'
         } as React.CSSProperties}
    >
      <header className="w-full py-6 bg-gradient-to-r from-black via-gray-900 to-black shadow-md border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center">
              <div className="w-4 h-4 bg-black"></div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Design<span className="font-light">App</span></h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-gray-900 to-black text-white p-12 md:p-16 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute left-0 top-0 w-full h-full">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full border border-white" 
                  style={{
                    width: `${Math.random() * 300 + 20}px`,
                    height: `${Math.random() * 300 + 20}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.1
                  }}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="max-w-md mx-auto md:mx-0 md:ml-auto md:mr-0 relative z-10">
            <div className="mb-3 flex items-center">
              <div className="w-12 h-1 bg-white mr-4"></div>
              <span className="text-sm uppercase tracking-widest font-light">Welcome</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tighter">
              Simple. <br />
              <span className="text-gray-400 font-light">Powerful.</span> <br />
              <span className="relative inline-block">
                Design Tool
                <span className="absolute bottom-2 left-0 w-full h-0.5 bg-white opacity-20"></span>
              </span>
            </h2>
            <p className="text-gray-400 mb-12 text-lg font-light leading-relaxed">
              Professional design platform for modern creators. 
              Clean interface, powerful features, seamless collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
            <button 
                className={`group px-8 py-4 bg-white text-black font-bold text-lg transition-all duration-300 relative overflow-hidden ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => (document.querySelector('button[aria-label="Sign in with Google"]') as HTMLButtonElement)?.click()}
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors duration-300">
                  <FaGoogle /> 
                  <span>Sign in with Google</span>
                </span>
                <span className="absolute inset-0 bg-black w-0 group-hover:w-full transition-all duration-300 ease-in-out"></span>
              </button>
              <Link
                to="/"
                className="group relative overflow-hidden px-8 py-4 border-2 border-white text-white font-bold text-lg transition-all duration-300 flex items-center justify-center"
                onMouseEnter={() => setHoverFeatures(true)}
                onMouseLeave={() => setHoverFeatures(false)}
              >
                <span className="flex items-center gap-3 relative z-10">
                  <FaMagic className={`transform transition-transform duration-300 ${hoverFeatures ? 'rotate-12' : ''}`} /> 
                  <span>Explore Features</span>
                  <FaArrowRight className={`transform transition-all duration-300 ${hoverFeatures ? 'translate-x-1 opacity-100' : 'opacity-0 -translate-x-2'}`} />
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right side - White section with image */}
        <div className="w-full md:w-1/2 bg-gray-50 p-12 md:p-16 flex items-center justify-center">
          <div className="max-w-md w-full">
           
            
            <div className="bg-white p-8 shadow-xl border border-gray-100 rounded-sm">
              <h3 className="text-2xl font-bold text-black mb-6 relative inline-block">
                Sign in to get started
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></span>
              </h3>
              {isLoading ? (
                <Loading  />
                
              ) : (
                <>
                  <div className="mb-8">
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
                  <div className="flex items-center mb-8">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <p className="px-4 text-sm text-gray-500">or</p>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div className="flex flex-col space-y-3 mb-6">
                    <button className="py-3 border border-gray-300 rounded-sm flex items-center justify-center space-x-2 hover:bg-gray-50 transition">
                      <FaLock className="text-gray-700" />
                      <span className="text-gray-700 font-medium">Continue as Guest</span>
                    </button>
                    <button className="py-3 border border-gray-300 rounded-sm flex items-center justify-center space-x-2 hover:bg-gray-50 transition">
                      <FaRegEye className="text-gray-700" />
                      <span className="text-gray-700 font-medium">View Demo</span>
                    </button>
                  </div>
                </>
              )}
              <p className="text-gray-500 text-sm">
                By signing in, you agree to our <Link to="/" className="text-black font-medium hover:underline">Terms of Service</Link> and <Link to="/" className="text-black font-medium hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-gradient-to-r from-black via-gray-900 to-black text-white border-t border-gray-800">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <p className="text-sm text-gray-400">&copy; {currentYear} Design App. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <Link to="/" className="text-gray-400 hover:text-white transition text-sm">Terms</Link>
            <Link to="/" className="text-gray-400 hover:text-white transition text-sm">Privacy</Link>
            <Link to="/" className="text-gray-400 hover:text-white transition text-sm">Help</Link>
            <Link to="/" className="text-gray-400 hover:text-white transition text-sm">Contact</Link>
          </div>
        </div>
      </footer>
      
    </div>
  );
};

export default Login;
