import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Droplets, CheckCircle, XCircle, Search } from "lucide-react";
import Swal from "sweetalert2";

const DonorHistory = () => {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // all, available, unavailable

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donors, searchTerm, filterBloodGroup, filterStatus]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/admin/donor-history`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDonors(data.donors || []);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch donor history",
        });
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...donors];

    if (searchTerm) {
      filtered = filtered.filter(
        (donor) =>
          donor.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donor.phone?.includes(searchTerm)
      );
    }

    if (filterBloodGroup) {
      filtered = filtered.filter(
        (donor) => donor.bloodGroup === filterBloodGroup
      );
    }

    if (filterStatus === "available") {
      filtered = filtered.filter((donor) => donor.isAvailable);
    } else if (filterStatus === "unavailable") {
      filtered = filtered.filter((donor) => !donor.isAvailable);
    }

    setFilteredDonors(filtered);
  };

  const calculateDaysUntilAvailable = (lastDonationDate) => {
    if (!lastDonationDate) return 0;

    const lastDate = new Date(lastDonationDate);
    const fourMonthsLater = new Date(lastDate);
    fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);

    const today = new Date();
    const diffTime = fourMonthsLater - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never donated";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "bg-red-100 text-red-800 border-red-300",
      "A-": "bg-red-200 text-red-900 border-red-400",
      "B+": "bg-blue-100 text-blue-800 border-blue-300",
      "B-": "bg-blue-200 text-blue-900 border-blue-400",
      "O+": "bg-green-100 text-green-800 border-green-300",
      "O-": "bg-green-200 text-green-900 border-green-400",
      "AB+": "bg-purple-100 text-purple-800 border-purple-300",
      "AB-": "bg-purple-200 text-purple-900 border-purple-400",
    };
    return colors[bloodGroup] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-error"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Droplets className="text-red-600" size={40} />
          Donor History & Availability
        </h1>
        <p className="text-gray-600">
          Track donor history and availability status (4-month donation cycle)
        </p>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Search</span>
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or phone"
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Blood Group Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Blood Group</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Status</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Not Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Total Donors</h3>
          <p className="text-4xl font-bold">{donors.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Available Now</h3>
          <p className="text-4xl font-bold">
            {donors.filter((d) => d.isAvailable).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Not Available</h3>
          <p className="text-4xl font-bold">
            {donors.filter((d) => !d.isAvailable).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Never Donated</h3>
          <p className="text-4xl font-bold">
            {donors.filter((d) => !d.lastDonationDate).length}
          </p>
        </motion.div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="text-center">#</th>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>Last Donation</th>
                <th>Next Available Date</th>
                <th>Status</th>
                <th>Days Until Available</th>
                <th>Blood Given</th>
                <th>Blood Taken</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No donors found
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor, index) => {
                  const daysUntil = calculateDaysUntilAvailable(
                    donor.lastDonationDate
                  );
                  return (
                    <motion.tr
                      key={donor._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <div className="font-semibold">{donor.Name}</div>
                        <div className="text-sm text-gray-500">
                          {donor.phone}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getBloodGroupColor(
                            donor.bloodGroup
                          )}`}
                        >
                          {donor.bloodGroup}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span>{formatDate(donor.lastDonationDate)}</span>
                        </div>
                      </td>
                      <td>
                        {donor.lastDonationDate ? (
                          <span className="text-sm">
                            {formatDate(donor.nextAvailableDate)}
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">
                            Available Now
                          </span>
                        )}
                      </td>
                      <td>
                        {donor.isAvailable ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={20} />
                            <span className="font-semibold">Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <XCircle size={20} />
                            <span className="font-semibold">Not Available</span>
                          </div>
                        )}
                      </td>
                      <td>
                        {daysUntil > 0 ? (
                          <span className="badge badge-warning">
                            {daysUntil} days
                          </span>
                        ) : donor.lastDonationDate ? (
                          <span className="badge badge-success">Ready</span>
                        ) : (
                          <span className="badge badge-info">New Donor</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Droplets size={16} className="text-red-500" />
                          <span className="font-semibold text-green-600">
                            {donor.bloodGiven || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Droplets size={16} className="text-blue-500" />
                          <span className="font-semibold text-blue-600">
                            {donor.bloodTaken || 0}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorHistory;
