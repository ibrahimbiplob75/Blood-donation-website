import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthProvider } from "../../context/ContextProvider.jsx";
import AxiosPublic from "../../context/AxiosPublic.jsx";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import BloodRequestModal from "../request/RequestModal.jsx";
import DonateBloodModal from "../donor/DonateBloodModal.jsx";

const BloodBank = () => {
  const { user } = useContext(AuthProvider);
  const navigate = useNavigate();
  const [publicAxios] = AxiosPublic();

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  const [donors, setDonors] = useState([]);
  const [displayedDonors, setDisplayedDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const districts = [
    "All",
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
    "Bogra",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Chapainawabganj",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
    "Barguna",
    "Barisal",
    "Bhola",
    "Jhalokathi",
    "Patuakhali",
    "Pirojpur",
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
    "Habiganj",
    "Moulvibazar",
    "Sunamganj",
    "Sylhet",
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
    "Mymensingh",
    "Jamalpur",
    "Netrokona",
    "Sherpur",
  ];

  // Fetch donors
  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await publicAxios.get("/users");
      // Filter only users with role 'user' (donors)
      const donorsList = response.data.filter(
        (u) => u.role === "user" && u.bloodGroup
      );
      setDonors(donorsList);
    } catch (error) {
      console.error("Error fetching donors:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to load donors",
        text: error?.response?.data?.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and limit
  useEffect(() => {
    let filtered = [...donors];

    // Search filter - searches by name, phone, course, and batch number
    if (searchTerm) {
      filtered = filtered.filter(
        (donor) =>
          (donor.name && donor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (donor.Name && donor.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (donor.phone && donor.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (donor.course && donor.course.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (donor.batchNo && donor.batchNo.toString().includes(searchTerm)) ||
          (donor.district && donor.district.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Blood group filter
    if (filterBloodGroup) {
      filtered = filtered.filter(
        (donor) => donor.bloodGroup === filterBloodGroup
      );
    }

    // District filter
    if (filterDistrict && filterDistrict !== "All") {
      filtered = filtered.filter((donor) => donor.district === filterDistrict);
    }

    // Availability filter
    if (filterAvailability) {
      filtered = filtered.filter((donor) => {
        const daysUntil = calculateDaysUntilAvailable(donor.lastDonateDate);
        const isAvailable = daysUntil === 0;

        if (filterAvailability === "available") {
          return isAvailable;
        } else if (filterAvailability === "unavailable") {
          return !isAvailable;
        }
        return true;
      });
    }

    // Limit to 10 if not logged in
    if (!user) {
      filtered = filtered.slice(0, 10);
    }

    setDisplayedDonors(filtered);
  }, [donors, searchTerm, filterBloodGroup, filterDistrict, filterAvailability, user]);

  // Contact donor
  const handleContact = (phone) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to contact donors",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      Swal.fire({
        icon: "info",
        title: "Contact Not Available",
        text: "This donor hasn't provided contact information",
      });
    }
  };

  // Mask phone number for non-logged-in users
  const maskPhone = (phone) => {
    if (!phone) return "Not Available";
    if (user) return phone;
    return phone.slice(0, 3) + "****" + phone.slice(-2);
  };

  const handleDonateBlood = () => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to register as a blood donor",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }
    setIsDonateModalOpen(true);
  };

  // Get blood group color
  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "bg-red-100 text-red-800",
      "A-": "bg-red-200 text-red-900",
      "B+": "bg-blue-100 text-blue-800",
      "B-": "bg-blue-200 text-blue-900",
      "O+": "bg-green-100 text-green-800",
      "O-": "bg-green-200 text-green-900",
      "AB+": "bg-purple-100 text-purple-800",
      "AB-": "bg-purple-200 text-purple-900",
    };
    return colors[bloodGroup] || "bg-gray-100 text-gray-800";
  };

  const calculateDaysUntilAvailable = (lastDonateDate) => {
    if (!lastDonateDate) return 0;

    const lastDate = new Date(lastDonateDate);
    const nextAvailableDate = new Date(lastDate);
    nextAvailableDate.setMonth(nextAvailableDate.getMonth() + 4);

    const today = new Date();
    const diffTime = nextAvailableDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-error"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-[#780A0A] mb-2">
          রক্ত দাতা তালিকা
        </h1>
        <p className="text-gray-600">
          Find blood donors in your area and save lives
        </p>

        {/* Donate Now Button */}
        {/* <div className="mt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn bg-[#780A0A] hover:bg-[#a00b0b] text-white"
          >
            🩸 Request Blood Now
          </button>
        </div> */}
      </motion.div>

      {/* Blood Request Modal */}
      <BloodRequestModal  
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <DonateBloodModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />

      {/* Login Notice for Non-Logged-In Users */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert bg-yellow-50 border border-yellow-200 mb-6 shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold text-yellow-800">Limited Preview</h3>
            <div className="text-sm text-yellow-700">
              You are viewing only 10 donors. Login or register to see the
              complete donor list and contact information.
            </div>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-sm bg-yellow-600 hover:bg-yellow-700 text-white border-none"
          >
            Login Now
          </button>
        </motion.div>
      )}

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Search Donors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Search</span>
            </label>
            <input
              type="text"
              placeholder="Name, phone, course, batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* Blood Group Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Blood Group</span>
            </label>
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">District</span>
            </label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="select select-bordered w-full"
            >
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Availability</span>
            </label>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Donors</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {displayedDonors.length}{" "}
            {user ? `of ${donors.length}` : "(Limited Preview)"} donors
          </span>
          {!user && (
            <span className="text-[#780A0A] font-semibold">
              Login to see all {donors.length} donors
            </span>
          )}
        </div>
      </motion.div>

      {/* Statistics */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stats shadow bg-white w-full mb-6"
        >
          <div className="stat">
            <div className="stat-figure text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Total Donors</div>
            <div className="stat-value text-error">{donors.length}</div>
            <div className="stat-desc">Available blood donors</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="stat-title">Districts Covered</div>
            <div className="stat-value text-primary">
              {new Set(donors.map((d) => d.district).filter(Boolean)).size}
            </div>
            <div className="stat-desc">Across Bangladesh</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-8 h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title">Blood Groups</div>
            <div className="stat-value text-secondary">8</div>
            <div className="stat-desc">All blood types available</div>
          </div>
        </motion.div>
      )}

      {/* Donors Grid */}
      {displayedDonors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            No Donors Found
          </h3>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedDonors.map((donor, index) => {
            // Calculate availability based on lastDonateDate
            const lastDonateDate = donor.lastDonateDate ? new Date(donor.lastDonateDate) : null;
            const daysUntil = calculateDaysUntilAvailable(donor.lastDonateDate);
            const isAvailable = daysUntil === 0;

            return (
              <motion.div
                key={donor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all relative"
              >
                {/* Header with Blood Group - Top */}
                <div className={`${getBloodGroupColor(donor.bloodGroup)} p-4 flex justify-between items-start`}>
                  <div>
                    <div className="text-xs font-semibold opacity-75 mb-1">Blood Type</div>
                    <div className="text-3xl font-bold">{donor.bloodGroup}</div>
                  </div>
                  {/* Availability Badge */}
                  <div className={`badge gap-1 ${isAvailable ? "badge-success" : "badge-warning"}`}>
                    <div className={`w-2 h-2 rounded-full ${isAvailable ? "animate-pulse" : ""}`}></div>
                    {isAvailable ? "Available" : "Unavailable"}
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-5">
                  {/* Donor Avatar & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-[#780A0A] to-[#a00b0b] text-white rounded-full w-14">
                        <span className="text-lg font-bold">
                          {donor.name?.charAt(0).toUpperCase() || "D"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        {donor.Name || "Anonymous"}
                      </h3>
                      <div className="text-xs text-gray-500">
                        {donor.course && donor.batchNo ? `${donor.course} ${donor.batchNo}` : "User"}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="divider my-2"></div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    {/* Email */}
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="break-all text-gray-700">{donor.email}</div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{donor.district || "N/A"}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className={!user ? "blur-sm" : ""}>
                        {maskPhone(donor.phone)}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-red-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Given</div>
                      <div className="text-lg font-bold text-red-600">{donor.bloodGiven || 0}</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Taken</div>
                      <div className="text-lg font-bold text-blue-600">{donor.bloodTaken || 0}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500">Role</div>
                      <div className="text-xs font-bold text-purple-600 capitalize">{donor.role}</div>
                    </div>
                  </div>

                  {/* Last Donation Info */}
                  {lastDonateDate && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4 text-xs">
                      <div className="text-yellow-800 font-semibold">
                        Last Donation: {lastDonateDate.toLocaleDateString()}
                      </div>
                      <div className="text-yellow-700">
                        {isAvailable ? "✓ Eligible to donate" : `Eligible in ${daysUntil} days`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Button */}
                <button
                  onClick={() => handleContact(donor.phone)}
                  className={`w-full py-3 font-semibold transition-all ${
                    user
                      ? "bg-[#780A0A] hover:bg-[#a00b0b] text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {user ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Contact Donor
                    </>
                  ) : (
                    "Login to Contact"
                  )}
                </button>

                {/* Blur overlay for non-logged-in users */}
                {!user && index >= 5 && (
                  <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <button
                      onClick={() => navigate("/login")}
                      className="btn bg-[#780A0A] hover:bg-[#a00b0b] text-white btn-sm"
                    >
                      Login to View
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Call to Action - Non-Logged-In Users */}
      {!user && displayedDonors.length >= 10 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center bg-gradient-to-r from-[#780A0A] to-[#a00b0b] text-white rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-4">
            Want to See All {donors.length} Donors?
          </h2>
          <p className="text-lg mb-6">
            Register now to access the complete donor database and save lives!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="btn btn-lg bg-white text-[#780A0A] hover:bg-gray-100 border-none"
            >
              Register Now
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-[#780A0A]"
            >
              Login
            </button>
          </div>
        </motion.div>
      )}

      {/* Become a Donor CTA */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Want to Save Lives?
        </h3>
        <p className="text-gray-600 mb-4">
          Join our community of blood donors and make a difference
        </p>
        <button
          onClick={handleDonateBlood}
          className="btn btn-error text-white w-full sm:w-auto min-w-[160px] text-sm sm:text-base"
        >
          Become a Donor Today
        </button>
      </motion.div> */}
    </div>
  );
};

export default BloodBank;
