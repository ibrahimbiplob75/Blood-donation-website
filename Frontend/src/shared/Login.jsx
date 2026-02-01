import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "../context/ContextProvider.jsx";
import useAxios from "../Hooks/useAxios.js";
import Swal from "sweetalert2";
import bloodLogo from "/assets/images/1142143.png";
import { useQueryClient } from "@tanstack/react-query";
import { clearAllTokens, setAdminToken, setUserToken } from "../utils/tokenManager.js";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, loader, checkAdminSession } = useContext(AuthProvider);
  const Axios = useAxios();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);

  const from = location.state?.from?.pathname || "/";

  // Navigate once auth context is fully updated after login
  useEffect(() => {
    if (pendingRedirect && !loader && user) {
      navigate(pendingRedirect, { replace: true });
      setPendingRedirect(null);
    }
  }, [user, loader, pendingRedirect, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clear all previous tokens before new login
    clearAllTokens();

    try {
      const csrfResponse = await Axios.get("/csrf-token", {
        withCredentials: true,
      });

      const response = await Axios.post(
        "/login",
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfResponse.data.csrfToken,
          },
        }
      );

      if (response.data.success) {
        // Store token based on user role
        if (response.data.token && response.data.user) {
          const userRole = response.data.user?.role;

          // Create standardized user data object
          const userData = {
            id: response.data.user._id,
            name: response.data.user.name || response.data.user.Name,
            email: response.data.user.email,
            role: response.data.user.role,
            avatar: response.data.user.avatar || null,
          };

          if (userRole === 'Admin' || userRole === 'admin' || userRole === 'Moderator' || userRole === 'moderator' || userRole === 'executive' || userRole === 'Executive') {
            setAdminToken(response.data.token, userData);
          } else {
            setUserToken(response.data.token, userData);
          }
        }

        const userRole = response.data.user?.role;

        // Update React Query cache so AdminRoute has auth data immediately
        queryClient.setQueryData(['adminAuth'], {
          authenticated: true,
          user: response.data.user,
        });

        // Update context state
        await checkAdminSession();

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: `${
            userRole === "Admin" || userRole === "admin" ? "Admin" : "User"
          } login successful!`,
          showConfirmButton: false,
          timer: 1500,
        });

        // Redirect based on role
        const adminRoles = ['Admin', 'admin', 'executive', 'Executive', 'moderator', 'Moderator'];
        const target = adminRoles.includes(userRole) ? "/admin" : from;
        setPendingRedirect(target);
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text:
          error.response?.data?.error || error.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-[#ffecec] to-[#f6bcbc] p-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-8"
      >
        <img src={bloodLogo} alt="Blood Logo" className="w-20 h-20 mb-2" />
        <h1 className="text-3xl font-extrabold text-[#780A0A] tracking-wide">
          রক্তের বন্ধন
        </h1>
        <p className="text-gray-700 font-semibold text-sm mt-1">
          লগইন করে রক্তের মহান অভিযানে অংশ নিন ❤️
        </p>
      </motion.div>

      {/* Form Box */}
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center text-[#780A0A] mb-6">
          লগইন করুন
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-gray-700">
            ইমেইল ঠিকানা
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#780A0A] focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="block font-semibold mb-1 text-gray-700">
            পাসওয়ার্ড
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#780A0A] focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-9 right-4 text-gray-500 hover:text-[#780A0A]"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 mt-2 text-white rounded-lg font-semibold text-lg transition-all duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#780A0A] hover:bg-[#a00b0b]"
          }`}
        >
          {loading ? "প্রসেস হচ্ছে..." : "লগইন"}
        </button>

        {/* Register Redirect */}
        <p className="text-center text-gray-700 mt-6">
          আপনার অ্যাকাউন্ট নেই? {" "}
          <Link
            to="/register"
            className="text-[#780A0A] font-semibold hover:underline"
          >
            রেজিস্টার করুন?
          </Link>
        </p>
      </motion.form>

      {/* Footer Note */}
      <p className="text-sm text-gray-600 mt-8">
        @ {new Date().getFullYear()} রক্তের বন্ধন | ভালোবাসায় একত্রিত মানবতা ❤️
      </p>
    </div>
  );
};

export default Login;
