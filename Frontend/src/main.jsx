import React from "react";
import "./index.css";
import App from "./App.jsx";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Login from "./shared/Login.jsx";
import Register from "./shared/Register.jsx";
import Home from "./components/Home/Home.jsx";

import AdminRoute from "./context/AdminRoute.jsx";
import Dashboard from "./components/admin/Dashboard.jsx";
import DashboardHome from "./components/admin/DashboardHome.jsx";
import UserManagement from "./components/admin/UserManagement.jsx";
import ContextProvider from "./context/ContextProvider.jsx";
import DonorHistory from "./components/donor/DonorHistory.jsx";
import BloodStock from "./components/inventory/BloodStock.jsx";
import BloodRequests from "./components/request/BloodRequests.jsx";
import BloodDataUpload from "./components/inventory/BloodDataUpload.jsx";
import BloodBank from "./components/inventory/BloodBank.jsx";
import UserProfile from "../src/pages/Userprofile.jsx"
import Statistics from "./components/admin/Statistics.jsx";
import ApprovalManagement from "./components/admin/ApprovalManagement.jsx";
import About from "./pages/About.jsx";
import Donor from "./pages/Donors.jsx";
import Blogs from "./pages/Blogs.jsx";

// Tanstack Query configuration for better caching and state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
    },
  },
});


const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
    children: [
      {
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "/login",
        element: <Login></Login>,
      },
      {
        path: "/profile",
        element: <UserProfile></UserProfile>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },
      {
        path: "/blood-bank",
        element: <Donor></Donor>,
      },
      {
        path: "/blood-requests",
        element: <BloodRequests></BloodRequests>,
      },
      {
        path: "/blogs",
        element:<Blogs></Blogs>
      },
      {
        path: "/about",
        element:<About></About>
      }
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Dashboard></Dashboard>
      </AdminRoute>
    ),
    children: [
      {
        path: "/admin",
        element: <DashboardHome></DashboardHome>,
      },
      {
        path: "/admin/blood-upload",
        element: <BloodDataUpload></BloodDataUpload>,
      },
      {
        path: "/admin/blood-stock",
        element: <BloodStock></BloodStock>,
      },
      {
        path: "/admin/donar-list",
        element: <BloodBank></BloodBank>,
      },
      {
        path: "/admin/donor-history",
        element: <DonorHistory></DonorHistory>,
      },
      {  path: "/admin/statistics",
        element: <Statistics></Statistics>,
      },
      {
        path: "/admin/approvals",
        element: <ApprovalManagement></ApprovalManagement>,
      },

      // Optional routes can be added when components exist
      {
        path: "/admin/blood-requests",
        element: <BloodRequests></BloodRequests>,
      },
      {
        path: "/admin/user-management",
        element: <UserManagement></UserManagement>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <div className="max-w mx-2">
          <RouterProvider router={router} />
        </div>
      </ContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
