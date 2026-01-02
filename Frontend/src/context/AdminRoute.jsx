import { Navigate } from "react-router-dom";
import { useUserRole } from "../Hooks/useAuthQuery.js";
import Loader from "../shared/Loader.jsx";

const AdminRoute = ({ children }) => {
  // Use Tanstack Query for better state management and caching
  const { isAdmin, authenticated, user, isLoading } = useUserRole();

  if (isLoading) {
    return <Loader></Loader>;
  }

  if (!authenticated) {
    return <Navigate to={"/login"}></Navigate>;
  }

  if (isAdmin) {
    return children;
  }

  return (
    <div className="min-h-[90hv] mt-20 flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>

        <p className="text-gray-600 mb-6">
          You are not authorized to access this page. Admin Role are required.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            <strong>User Email:</strong> {user?.email || 'N/A'}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Your Role:</strong> {user?.role || 'User'}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Required Role:</strong> Admin
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you believe this is an error, please contact your system
          administrator.
        </p>
      </div>
    </div>
  );
};

export default AdminRoute;
