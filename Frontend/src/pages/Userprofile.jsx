import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Droplets,
  Calendar,
  Award,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Edit2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { AuthProvider } from "../context/ContextProvider";
import { baseURL } from "../Hooks/useAxios";
import Swal from "sweetalert2";

const UserProfile = () => {
  const { user } = useContext(AuthProvider);
  const [profile, setProfile] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    district: "",
    bloodGroup: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const districts = [
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

  useEffect(() => {
    if (user?.email) {
      fetchUserProfile(user.email);
    }
  }, [user]);

  const fetchUserProfile = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/profile?email=${encodeURIComponent(email)}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure profile has bloodGiven and bloodTaken fields
        const profileData = {
          ...data.profile,
          bloodGiven: data.profile.bloodGiven || 0,
          bloodTaken: data.profile.bloodTaken || 0
        };
        setProfile(profileData);
        setStatistics(data.statistics);
        setDonationHistory(data.donationHistory || []);
        setRequestHistory(data.requestHistory || []);

        setEditForm({
          name: data.profile.name,
          phone: data.profile.phone,
          email: data.profile.email,
          district: data.profile.district,
          bloodGroup: data.profile.bloodGroup,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load profile",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      district: profile.district,
      bloodGroup: profile.bloodGroup,
    });
  };

  const handleSave = async () => {
    try {
      const idToUse = profile?._id;
      const emailToUse = user?.email || editForm.email || "";
      const queryParam = idToUse ? `id=${idToUse}` : `email=${encodeURIComponent(emailToUse)}`;
      const response = await fetch(`${baseURL}/profile?${queryParam}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          district: editForm.district,
          bloodGroup: editForm.bloodGroup,
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile updated successfully",
        });
        setIsEditing(false);
        if (user?.email) {
          fetchUserProfile(user.email);
        }
      } else {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to update profile",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to connect to server",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilEligible = () => {
    if (!statistics?.donations?.nextEligibleDate) return null;
    const nextDate = new Date(statistics.donations.nextEligibleDate);
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "fulfilled":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "cancelled":
        return "badge-error";
      case "active":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "emergency":
        return "text-red-600 font-bold";
      case "urgent":
        return "text-orange-600 font-semibold";
      case "normal":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-error"></span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-error mb-4" />
          <p className="text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <User className="text-red-600" size={40} />
          My Profile
        </h1>
        <p className="text-gray-600">View and manage your donor profile</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Profile Information
          </h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn btn-sm btn-outline gap-2"
            >
              <Edit2 size={16} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="btn btn-sm bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-sm btn-outline gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="flex items-center gap-3">
            <User className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Full Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="input input-bordered input-sm w-full mt-1"
                />
              ) : (
                <p className="text-lg font-semibold">{profile.name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-semibold">{profile.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Phone</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="input input-bordered input-sm w-full mt-1"
                />
              ) : (
                <p className="text-lg font-semibold">{profile.phone}</p>
              )}
            </div>
          </div>

          {/* Blood Group */}
          <div className="flex items-center gap-3">
            <Droplets className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Blood Group</p>
              {isEditing ? (
                <select
                  value={editForm.bloodGroup}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bloodGroup: e.target.value })
                  }
                  className="select select-bordered select-sm w-full mt-1"
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-lg font-semibold badge badge-lg badge-error text-white">
                  {profile.bloodGroup}
                </p>
              )}
            </div>
          </div>

          {/* District */}
          <div className="flex items-center gap-3">
            <MapPin className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">District</p>
              {isEditing ? (
                <select
                  value={editForm.district}
                  onChange={(e) =>
                    setEditForm({ ...editForm, district: e.target.value })
                  }
                  className="select select-bordered select-sm w-full mt-1"
                >
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-lg font-semibold">{profile.district}</p>
              )}
            </div>
          </div>

          {/* Last Donate Date */}
          <div className="flex items-center gap-3">
            <Calendar className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-500">Last Donated Blood</p>
              <p className="text-lg font-semibold">
                {formatDate(profile.lastDonateDate)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Donations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Droplets size={32} />
            <Award size={32} className="opacity-50" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Donations (Given)</p>
          <p className="text-4xl font-bold">
            {profile?.bloodGiven || 0}
          </p>
          <p className="text-xs opacity-75 mt-2">
            Blood units donated
          </p>
        </motion.div>

        {/* Last Donation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar size={32} />
            <Clock size={32} className="opacity-50" />
          </div>
          <p className="text-sm opacity-90 mb-1">Last Donation</p>
          <p className="text-2xl font-bold">
            {formatDate(profile?.lastDonateDate)}
          </p>
          {(() => {
            if (!profile?.lastDonateDate) {
              return (
                <p className="text-xs opacity-75 mt-2 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Eligible to donate now
                </p>
              );
            }
            const lastDate = new Date(profile.lastDonateDate);
            const nextEligible = new Date(lastDate);
            nextEligible.setMonth(nextEligible.getMonth() + 3);
            const today = new Date();
            const canDonate = today >= nextEligible;
            const daysUntil = Math.ceil((nextEligible - today) / (1000 * 60 * 60 * 24));
            
            return canDonate ? (
              <p className="text-xs opacity-75 mt-2 flex items-center gap-1">
                <CheckCircle size={14} />
                Eligible to donate now
              </p>
            ) : (
              <p className="text-xs opacity-75 mt-2">
                Next eligible in {daysUntil} days
              </p>
            );
          })()}
        </motion.div>

        {/* Total Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText size={32} />
            <Activity size={32} className="opacity-50" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Blood Taken</p>
          <p className="text-4xl font-bold">
            {profile?.bloodTaken || 0}
          </p>
          <div className="flex gap-2 text-xs mt-2">
            <span className="opacity-75">
              Blood units received
            </span>
          </div>
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock size={32} />
            <AlertCircle size={32} className="opacity-50" />
          </div>
          <p className="text-sm opacity-90 mb-1">Pending Requests</p>
          <p className="text-4xl font-bold">
            {statistics?.requests?.pending || 0}
          </p>
          <p className="text-xs opacity-75 mt-2">
            {statistics?.requests?.cancelled || 0} cancelled
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-white shadow-lg p-2">
        <button
          className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "donations" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("donations")}
        >
          Donation History ({donationHistory.length})
        </button>
        <button
          className={`tab ${activeTab === "requests" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Request History ({requestHistory.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Droplets className="text-red-600" />
              Recent Donations
            </h3>
            {donationHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No donations yet</p>
            ) : (
              <div className="space-y-3">
                {donationHistory.slice(0, 5).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{donation.bloodGroup}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(donation.date)}
                      </p>
                    </div>
                    <span className="badge badge-error text-white">
                      {donation.units} unit{donation.units > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="text-red-600" />
              Recent Requests
            </h3>
            {requestHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {requestHistory.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{request.bloodGroup}</p>
                      <p className="text-sm text-gray-600">
                        {request.hospitalName}
                      </p>
                    </div>
                    <span className={`badge ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Donations Tab */}
      {activeTab === "donations" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Collected By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {donationHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No donation history
                    </td>
                  </tr>
                ) : (
                  donationHistory.map((donation) => (
                    <tr key={donation.id} className="hover">
                      <td>{formatDate(donation.date)}</td>
                      <td>
                        <span className="badge badge-error text-white">
                          {donation.bloodGroup}
                        </span>
                      </td>
                      <td className="font-semibold">{donation.units}</td>
                      <td className="text-sm text-gray-600">
                        {donation.collectedBy || "N/A"}
                      </td>
                      <td className="text-sm text-gray-600">
                        {donation.notes || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th>Date</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Hospital</th>
                  <th>Urgency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requestHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No request history
                    </td>
                  </tr>
                ) : (
                  requestHistory.map((request) => (
                    <tr key={request.id} className="hover">
                      <td>{formatDate(request.createdAt)}</td>
                      <td>
                        <span className="badge badge-error text-white">
                          {request.bloodGroup}
                        </span>
                      </td>
                      <td className="font-semibold">{request.units}</td>
                      <td className="text-sm">{request.hospitalName}</td>
                      <td>
                        <span
                          className={`text-sm ${getUrgencyColor(
                            request.urgency
                          )}`}
                        >
                          {request.urgency}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusColor(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserProfile;
