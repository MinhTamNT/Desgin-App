import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import "./App.css";
import routes from "./routes/index.tsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={routes} />
);
