import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  LogOut,
  LayoutDashboard,
  Droplets,
  Users,
  Heart,
  Activity,
  FileText,
  Settings,
  Clock,
} from "lucide-react";

import useAxios from "../../Hooks/useAxios.js";
import Swal from "sweetalert2";
import { useContext, useEffect, useState } from "react";
import { useUserRole } from "../../Hooks/useAuthQuery.js";
import { baseURL } from "../../Hooks/useAxios.js";
import { AuthProvider } from "../../context/ContextProvider.jsx";

const Dashboard = () => {
  const { user, userRole, LogOut: handleLogout } = useContext(AuthProvider);
  const location = useLocation();
  const { user: userData, isLoading: userLoading } = useUserRole();
  const displayRole = userData?.role || userRole || "";
  const Axios = useAxios();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
    };
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${baseURL}/admin/verify-token`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUserName(data.user.name);
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleLogoutsubmit = async () => {
    try {
      const result = await Swal.fire({
        title: "Confirm Logout",
        text: "Remove access from admin panel?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await handleLogout();
        setIsAuthenticated(false);
        Swal.fire({
          title: "Logged Out",
          icon: "success",
          timer: 900,
          showConfirmButton: false,
        });
        navigate("/");
      }
    } catch {
      Swal.fire({
        title: "Logout Failed",
        text: "An error occurred while logging out.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="drawer lg:drawer-open">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />

        {/* Main Content */}
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div className="navbar min-h-24 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl">
            <div className="flex-none lg:hidden">
              <label
                htmlFor="my-drawer"
                aria-label="open sidebar"
                className="btn btn-square btn-error"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </label>
            </div>
            <div className="mx-2 flex-1 px-2">
              <Link to="/admin" className="flex items-center gap-3">
                <Droplets className="h-10 w-10" />
                <div>
                  <h1 className="text-xl font-bold">Blood Bank Portal</h1>
                  <p className="text-xs text-red-100">Saving Lives Together</p>
                </div>
              </Link>
            </div>
            <div className="hidden lg:flex gap-2">
              <div className="text-right mr-4">
                <p className="text-xs text-red-100">{displayRole}</p>
              </div>
              <Link
                to="/"
                className="btn bg-white text-red-600 hover:bg-red-50 hover:shadow-lg flex gap-2 items-center"
              >
                <Home size={18} /> Home
              </Link>
              <button
                onClick={handleLogoutsubmit}
                className="btn bg-red-800 hover:bg-red-900 text-white flex gap-2 items-center"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </div>

        {/* Sidebar */}
        <div className="drawer-side shadow-xl">
          <label
            htmlFor="my-drawer"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="bg-white min-h-full w-72 p-4 shadow-2xl shadow-red-200/50">
            <div className="my-6 flex justify-center">
              <Link
                to="/"
                className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg hover:scale-110 transition-transform"
              >
                <Droplets size={32} />
              </Link>
            </div>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 mb-6 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {(
                    userData?.user?.firstName ||
                    user?.displayName ||
                    "?"
                  ).charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {userData?.user?.firstName || user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-red-600">{displayRole}</p>
                  {userData?.user?.branch && (
                    <p className="text-xs text-gray-500">
                      {userData.user.branch}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Menu */}
            <ul className="space-y-1">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-4 mb-2 px-2">
                Overview
              </p>
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
              </li>

              <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-6 mb-2 px-2">
                Donor Management
              </p>

              <li>
                <Link
                  to="/admin/donar-list"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/donar-list")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <Users size={20} /> Blood bank List
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/donor-history"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/donor-history")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <Activity size={20} /> Donation History
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/approvals"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/approvals")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <Clock size={20} /> Pending Approvals
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/blood-upload"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/blood-upload")
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <Heart size={20} /> Add Donor List
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/blood-stock"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/blood-stock")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <Droplets size={20} /> Blood Stock
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/blood-requests"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/requests")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <FileText size={20} /> Blood Requests
                </Link>
              </li>

              

              

              <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-6 mb-2 px-2">
                Settings
              </p>
              <li>
                <Link
                  to="/admin/statistics"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/statistics")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <Activity size={20} /> Statistics
                </Link>
              </li>

              <li>
                <Link
                  to="/admin/user-management"
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive("/admin/user-management")
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/50 scale-105 font-semibold"
                      : "hover:bg-red-50 hover:shadow-md text-gray-700"
                  }`}
                >
                  <Settings size={20} /> Admin Management
                </Link>
              </li>
            </ul>

            {/* Mobile Logout */}
            <div className="mt-8 lg:hidden">
              <button
                onClick={handleLogout}
                className="btn btn-error w-full flex items-center justify-center gap-2"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>

            {/* Blood Type Quick Reference */}
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-bold text-gray-700 mb-2">
                Blood Type Reference
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (type) => (
                    <div
                      key={type}
                      className="bg-white rounded px-2 py-1 text-xs font-semibold text-red-600 border border-red-200"
                    >
                      {type}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
