import banglaLogo from "../../public/assets/images/1142143.png";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { ShieldUser, LogOut, User, UserIcon } from "lucide-react";
import { AuthProvider } from "../context/ContextProvider.jsx";
import { useUserRole } from "../Hooks/useAuthQuery.js";
import { FaPhoneAlt } from "react-icons/fa";


const Header = () => {
  const {
    user,
    userRole,
    isAdmin: contextIsAdmin,
    LogOut: handleLogout,
  } = useContext(AuthProvider);
  const { user: backendUserData, isLoading: userLoading } = useUserRole();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  console.log("User Role in Header:", userRole);

  const navItems = [
    { href: "/", label: "হোম" },
    { href: "/blood-bank", label: "Blood bank" },
    { href: "/blood-requests", label: "Blood Request" },
    { href: "/blogs", label: "ব্লগ" },
    { href: "/about", label: "আমাদের সম্পর্কে" },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogoutClick = async () => {
    await handleLogout();
    setIsAvatarOpen(false);
    navigate("/");
  };

  const effectiveRole = backendUserData?.user?.role || userRole;
  const isAdmin =
    contextIsAdmin ||
    effectiveRole === "admin" ||
    effectiveRole === "Admin" ||
    effectiveRole === "moderator";
  const isLoggedIn = user !== null;

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-[1450px] mx-auto px-4 md:px-6 flex justify-between items-center py-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={banglaLogo} alt="logo" className="w-16 h-16" />

          {/* <h1 className="font-extrabold text-xl text-[#780A0A] hidden md:block">
            রক্তের বন্ধন
          </h1>*/}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex space-x-8 items-center">
          {navItems.map((item) => (
            <motion.div key={item.href} whileHover={{ scale: 1.05 }}>
              <Link
                to={item.href}
                className="text-gray-700 hover:text-[#780A0A] font-medium transition"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Auth & Contact */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Contact Icons */}
          <a
            href="tel:01883393337"
            className="flex items-center gap-2 text-gray-700 hover:text-[#780A0A] transition"
          >
            <FaPhoneAlt />
          </a>

          {/* User Avatar or Login */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                className="w-10 h-10 rounded-full bg-[#780A0A] text-white flex items-center justify-center font-bold hover:opacity-90 transition"
              >
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() || <User size={18} />}
              </button>

              {isAvatarOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border rounded-xl shadow-lg z-50">
                  <div className="p-3 border-b">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email || ""}</p>

                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                        {effectiveRole}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#780A0A] hover:text-white transition"
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    <UserIcon size={14} /> Profile
                  </Link>

                  {/* Show Dashboard only for admin/executive */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#780A0A] hover:text-white transition"
                      onClick={() => setIsAvatarOpen(false)}
                    >
                      <ShieldUser size={16} /> Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-[#780A0A] hover:text-white transition"
                  >
                    <LogOut size={16} /> লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#780A0A] text-white px-4 py-2 rounded-lg hover:bg-black transition font-semibold"
            >
              লগইন
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-gray-700 hover:text-[#780A0A] transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Auth & Menu Button */}
        <div className="lg:hidden flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                className="w-9 h-9 rounded-full bg-[#780A0A] text-white flex items-center justify-center font-bold hover:opacity-90 transition text-sm"
              >
                {user?.displayName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() || <User size={16} />}
              </button>

              {isAvatarOpen && (
                <div className="absolute right-0 mt-3 w-44 bg-white border rounded-xl shadow-lg z-50">
                  <div className="p-2 border-b">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || ""}
                    </p>

                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                        {effectiveRole}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#780A0A] hover:text-white transition"
                    onClick={() => setIsAvatarOpen(false)}
                  >
                    <ShieldUser size={14} /> Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#780A0A] hover:text-white transition"
                      onClick={() => setIsAvatarOpen(false)}
                    >
                      <ShieldUser size={14} /> Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#780A0A] hover:text-white transition"
                  >
                    <LogOut size={14} /> লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#780A0A] text-white px-3 py-1.5 rounded-lg hover:bg-black transition text-sm font-semibold"
            >
              লগইন
            </Link>
          )}

          <button
            onClick={toggleMobileMenu}
            className="p-2 text-gray-700 hover:text-[#780A0A] transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-white border-t shadow-lg"
        >
          <div className="flex flex-col space-y-2 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-[#780A0A] font-medium py-2 transition"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-4 pt-2 border-t">
              <a
                href="tel:017xxxxxxxx"
                className="flex items-center gap-2 text-gray-700 hover:text-[#780A0A] transition"
              >
                <FaPhoneAlt /> Contact
              </a>
              
            </div>
          </div>
        </motion.nav>
      )}
    </header>
  );
};

export default Header;
