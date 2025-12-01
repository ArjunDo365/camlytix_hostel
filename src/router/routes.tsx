import { lazy } from "react";
import Cameras from "../pages/Cameras";
import NVR from "../pages/NVR";
import AppSettings from "../pages/AppSetting";
import Blocks from "../pages/Blocks";
import Floors from "../pages/Floors";
import Section from "../pages/Section";
import Student from "../pages/Student";
import NewLogin from "../pages/NewLogin";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../pages/ProtectedRoute";
import AttendanceDetails from "../pages/AttendanceDetails";
const Index = lazy(() => import("../pages/Index"));

const routes = [
  // dashboard
  {
    path: "/",
    element: <NewLogin />,
    layout: "blank",
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    layout: "default",
  },
  {
    path: "/camera",
    element: (
      <ProtectedRoute>
        <Cameras />
      </ProtectedRoute>
    ),
    layout: "default",
  },
  {
    path: "/nvr",
    element: (
      <ProtectedRoute>
        <NVR />
      </ProtectedRoute>
    ),
    layout: "default",
  },
  {
    path: "/appSettings",
    element: (
      <ProtectedRoute>
        <AppSettings />
      </ProtectedRoute>
    ),
    layout: "default",
  },
  {
    path: "/block",
    element: (
      <ProtectedRoute>
        <Blocks />
      </ProtectedRoute>
    ),
    layout: "default",
  },
  {
    path: "/floor",
    element: (
      <ProtectedRoute>
        <Floors />
      </ProtectedRoute>
    ),
    layout: "default",
  },
  {
    path: "/section",
    element: (
      <ProtectedRoute>
        <Section />
      </ProtectedRoute>
    ),
    layout: "default",
  },
  {
    path: "/student",
    element: (
      <ProtectedRoute>
        <Student />
      </ProtectedRoute>
    ),
    layout: "default",
  },{
    path: "/attendance",
    element: (
      <ProtectedRoute>
        <AttendanceDetails />
      </ProtectedRoute>
    ),
    layout: "default",
  },
];

export { routes };
