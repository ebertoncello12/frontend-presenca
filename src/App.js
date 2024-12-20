import get from "lodash/get";
import Auth from "./pages/Auth";
import { useSelector } from "react-redux";
import { useRoutes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Attendance from "./pages/Attendance";
import Home from "./pages/HomePage/Home";
import Classes from "./pages/Classes/Classes";
import QrCode from "./pages/QrCode/QrCode";


const routes = (accessToken) => [
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/",
    element: accessToken ? (
      <Dashboard>
        <Navigate to="/home" />
      </Dashboard>
    ) : (
      <Navigate to="/login" />
    ),
    children: [
      { path: "/home", element: <Home /> },
      { path: "/aulas", element: <Classes /> },
      { path: "/faltas", element: <Attendance /> },
      { path: "/presenca", element: <Attendance /> },
      { path: "/configuracao", element: <Attendance /> },
      { path: "/qrcode", element: <QrCode /> },
    ],
  },
];


export default function App() {
  const accessToken = useSelector((state) => state.auth.profile.accessToken);

  const routing = useRoutes(routes(accessToken));

  return <>{routing}</>;
}
