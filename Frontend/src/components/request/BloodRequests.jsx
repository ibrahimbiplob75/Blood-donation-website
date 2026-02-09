import { useState, useEffect, useContext } from "react";
import { AuthProvider } from "../../context/ContextProvider.jsx";
import { useNavigate } from "react-router-dom";
import AxiosPublic from "../../context/AxiosPublic.jsx";
import useAxios from "../../Hooks/useAxios.js";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const BloodRequests = () => {
  const { user, userRole } = useContext(AuthProvider);
  const [publicAxios] = AxiosPublic();
  const secureAxios = useAxios();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showBloodBankModal, setShowBloodBankModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bloodStock, setBloodStock] = useState({});
  const [bankDonationUnits, setBankDonationUnits] = useState(1);
  const [donorBloodGroup, setDonorBloodGroup] = useState(null);
  const [donorBloodGroupLoading, setDonorBloodGroupLoading] = useState(false);
  const [availableBloodBags, setAvailableBloodBags] = useState([]);
  const [loadingBags, setLoadingBags] = useState(false);
  const [selectedBloodBag, setSelectedBloodBag] = useState(null);
  const [bankPatientInfo, setBankPatientInfo] = useState({
    patientName: "",
    patientId: "",
    dateUsed: new Date().toISOString().split('T')[0],
    notes: "",
  });

  // Filter states
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");

  const bloodGroups = [
    "A+",
    "A-",
    "B+",
    "B-",
    "O+",
    "O-",
    "AB+",
    "AB-",
  ];

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

  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch donor's blood group when user is available
  useEffect(() => {
    if (user) {
      fetchDonorBloodGroup();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await publicAxios.get("/blood-requests");
      setRequests(response.data);
      setFilteredRequests(
        response.data.filter((req) => req.status === "pending")
      );
    } catch (error) {
      console.error("Error fetching requests:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to load requests",
        text: error?.response?.data?.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = requests;

    if (filterBloodGroup) {
      filtered = filtered.filter((req) => req.bloodGroup === filterBloodGroup);
    }

    if (filterDistrict && filterDistrict !== "All") {
      filtered = filtered.filter((req) => req.district === filterDistrict);
    }

    if (filterStatus) {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    if (filterUrgency) {
      filtered = filtered.filter((req) => req.urgency === filterUrgency);
    }

    setFilteredRequests(filtered);
  }, [filterBloodGroup, filterDistrict, filterStatus, filterUrgency, requests]);

  // Function to fetch donor's blood group
  const fetchDonorBloodGroup = async () => {
    if (!user) return null;
    
    try {
      setDonorBloodGroupLoading(true);
      const response = await secureAxios.get(`/users?email=${user.email}`);
      if (response.data && response.data.length > 0) {
        const blood = response.data[0]?.bloodGroup || null;
        setDonorBloodGroup(blood);
        return blood;
      }
    } catch (error) {
      console.error("Error fetching donor blood group:", error);
    } finally {
      setDonorBloodGroupLoading(false);
    }
    return null;
  };

  // Function to check if donor's blood group matches request
  const isBloodGroupMatch = (requestBloodGroup) => {
    if (!donorBloodGroup) return false;
    return donorBloodGroup === requestBloodGroup;
  };

  const handleDonateClick = (request) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to donate blood",
      });
      return;
    }

    // Check blood group match
    if (!isBloodGroupMatch(request.bloodGroup)) {
      Swal.fire({
        icon: "error",
        title: "Blood Group Mismatch",
        text: `This request requires ${request.bloodGroup} blood group. Your blood group (${donorBloodGroup || "not found"}) does not match.`,
        confirmButtonColor: "#780A0A",
      });
      return;
    }

    setSelectedRequest(request);
    setShowDonateModal(true);
  };

  const handleConfirmDonate = async () => {
    try {
      let donorName, donorPhone;

      if (userRole === "admin" || userRole === "Admin" || userRole === "executive") {
        donorName = "Blood Bank";
        // Fetch admin phone from user data
        const userResponse = await secureAxios.get(
          `/users?email=${user.email}`
        );
        donorPhone = userResponse.data[0]?.phone || "Not Available";
      } else {
        // Regular user
        const userResponse = await secureAxios.get(
          `/users?email=${user.email}`
        );
        donorName =
          userResponse.data[0]?.Name || user.displayName || "Anonymous";
        donorPhone = userResponse.data[0]?.phone || "Not Available";
      }

      // Use secureAxios (with token) for authenticated request
      await secureAxios.put(`/blood-requests/${selectedRequest._id}/donate`, {
        donorName: donorName,
        donorPhone: donorPhone,
        fulfilledBy: user?.email || "",
      });

      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your donation has been registered",
        showConfirmButton: false,
        timer: 1500,
      });

      setShowDonateModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error confirming donation:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.response?.data?.message || "Server error",
      });
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    if (userRole !== "admin" && userRole !== "Admin" && userRole !== "executive") {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "Only admins can update request status",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Update Status",
        text: `Change status to ${newStatus}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#780A0A",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, update it!",
      });

      if (result.isConfirmed) {
        // Use secureAxios with token for authenticated request
        await secureAxios.put(`/blood-requests/${requestId}/status`, {
          status: newStatus,
          fulfilledBy: user?.email || "",
        });

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          showConfirmButton: false,
          timer: 1500,
        });

        fetchRequests();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error?.response?.data?.message || "Server error",
      });
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (userRole !== "Admin" && userRole !== "executive") {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "Only admins can delete requests",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Delete Request?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await publicAxios.delete(`/blood-requests/${requestId}`);

        Swal.fire({
          icon: "success",
          title: "Deleted",
          showConfirmButton: false,
          timer: 1500,
        });

        fetchRequests();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error?.response?.data?.message || "Server error",
      });
    }
  };

  const handleContact = (contactNumber) => {
    window.location.href = `tel:${contactNumber}`;
  };

  // Fetch blood stock
  const fetchBloodStock = async () => {
    try {
      const response = await publicAxios.get("/admin/all-blood-stock");
      if (response.data.success && response.data.stock) {
        setBloodStock(response.data.stock);
      } else {
        // Initialize with all blood groups set to 0 if no data
        const emptyStock = {};
        bloodGroups.forEach(group => {
          emptyStock[group] = 0;
        });
        setBloodStock(emptyStock);
      }
    } catch (error) {
      console.error("Error fetching blood stock:", error);
      // Initialize with all blood groups set to 0 on error
      const emptyStock = {};
      bloodGroups.forEach(group => {
        emptyStock[group] = 0;
      });
      setBloodStock(emptyStock);
    }
  };

  // Fetch available blood bags for a specific blood group
  const fetchAvailableBloodBags = async (bloodGroup) => {
    try {
      setLoadingBags(true);
      const response = await secureAxios.get(
        `/admin/available-blood-bags?bloodGroup=${encodeURIComponent(bloodGroup)}`
      );
      let bagsData = [];
      
      // Handle different response structures
      if (Array.isArray(response.data)) {
        bagsData = response.data;
      } else if (response.data?.bags && Array.isArray(response.data.bags)) {
        bagsData = response.data.bags;
      }
      
      if (bagsData.length > 0) {
        setAvailableBloodBags(bagsData);
        setSelectedBloodBag(bagsData[0]._id);
        setBankDonationUnits(bagsData[0].units);
      } else {
        setAvailableBloodBags([]);
        setSelectedBloodBag(null);
      }
    } catch (error) {
      console.error("Error fetching blood bags:", error);
      setAvailableBloodBags([]);
      setSelectedBloodBag(null);
    } finally {
      setLoadingBags(false);
    }
  };

  // Handle blood bank donation click
  const handleBloodBankClick = async (request) => {
    await fetchBloodStock();
    await fetchAvailableBloodBags(request.bloodGroup);
    setSelectedRequest(request);
    setBankDonationUnits(1);
    setSelectedBloodBag(null);
    setBankPatientInfo({
      patientName: request.requesterName || "",
      patientId: "",
      dateUsed: new Date().toISOString().split('T')[0],
      notes: "",
    });
    setShowBloodBankModal(true);
  };

  // Confirm blood bank donation
  const handleConfirmBloodBankDonation = async () => {
    if (!selectedRequest || !selectedBloodBag) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please select a blood bag",
      });
      return;
    }

    if (!bankPatientInfo.patientName) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please enter patient name",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await secureAxios.put(
        `/blood-requests/${selectedRequest._id}/donate-from-bank`,
        {
          selectedBloodBagId: selectedBloodBag,
          units: parseInt(bankDonationUnits),
          usedFor: {
            patientName: bankPatientInfo.patientName,
            patientId: bankPatientInfo.patientId || null,
            hospitalName: selectedRequest.hospitalName,
            dateUsed: bankPatientInfo.dateUsed,
            usedBy: user?.name || user?.displayName || "Admin",
            notes: bankPatientInfo.notes,
          },
          adminEmail: user?.email,
          adminName: user?.name || user?.displayName,
        }
      );

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Successfully assigned ${bankDonationUnits} unit(s) from blood bank to ${bankPatientInfo.patientName}`,
          timer: 2000,
        });

        setShowBloodBankModal(false);
        setSelectedRequest(null);
        setBankDonationUnits(1);
        setSelectedBloodBag(null);
        setBankPatientInfo({
          patientName: "",
          patientId: "",
          dateUsed: new Date().toISOString().split('T')[0],
          notes: "",
        });
        fetchRequests();
      }
    } catch (error) {
      console.error("Blood bank donation error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to donate from blood bank",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the requester
  const isRequester = (request) => {
    if (!user) return false;
    return request.requesterEmail === user.email;
  };

  // Check if user can see donor details
  const canSeeDonorDetails = (request) => {
    if (!user) return false;
    // Admin can always see
    if (userRole === "admin" || userRole === "Admin" || userRole === "executive") return true;
    // Requester can see
    if (request.requesterEmail === user.email) return true;
    // Donor who fulfilled can see
    if (request.fulfilledBy === user.email || request.donorPhone) {
      // Check if current user is the donor
      return request.fulfilledBy === user.email;
    }
    return false;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "emergency":
        return "badge-error";
      case "urgent":
        return "badge-warning";
      case "normal":
        return "badge-info";
      default:
        return "badge-ghost";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "active":
        return "badge-info";
      case "fulfilled":
        return "badge-success";
      case "cancelled":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#780A0A] mb-4">
              {userRole === "Admin" || userRole === "executive"
                ? "Donate from Blood Bank"
                : "Confirm Blood Donation"}
            </h2>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>Blood Group:</strong> {selectedRequest?.bloodGroup}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Hospital:</strong> {selectedRequest?.hospitalName}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Location:</strong> {selectedRequest?.hospitalLocation}
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Urgency:</strong>
                <span
                  className={`badge ${getUrgencyColor(
                    selectedRequest?.urgency
                  )} ml-2`}
                >
                  {selectedRequest?.urgency}
                </span>
              </p>

              {userRole === "admin" || userRole === "executive" ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-blue-800 font-semibold">
                    This donation will be marked as "Blood Bank" donation with
                    your contact information.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-800 font-semibold">
                    Your name and phone number will be shared with the
                    requester.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmDonate}
                className="btn flex-1 bg-[#780A0A] hover:bg-[#a00b0b] text-white"
              >
                Yes, accept to donate
              </button>
              <button
                onClick={() => {
                  setShowDonateModal(false);
                  setSelectedRequest(null);
                }}
                className="btn flex-1 btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-[#780A0A] mb-2">
          Blood Requests
        </h1>
        <p className="text-gray-600">
          Help save lives by responding to blood donation requests
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-xl p-6 mb-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Status Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Status</span>
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option defaultChecked value="">
                All Statuses
              </option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Urgency</span>
            </label>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Urgencies</option>
              <option value="emergency">Emergency</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </motion.div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4"></div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            No Requests Found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or check back later
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              // onClick={() => navigate(`/blood-request/${request._id}`)}
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-3xl font-bold text-[#780A0A] mb-1">
                    {request.bloodGroup}
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`badge ${getUrgencyColor(
                        request.urgency
                      )} badge-sm`}
                    >
                      {request.urgency}
                    </span>
                    <span
                      className={`badge ${getStatusColor(
                        request.status
                      )} badge-sm`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 mb-1">ID: {request._id?.slice(-8) || "N/A"}</div>
                  <div className="text-xs text-gray-500">
                    {formatDate(request.createdAt)}
                  </div>
                </div>
              </div>

              {/* Hospital Info */}
              <div className="mb-4">
                <div className="flex items-start mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {request.hospitalName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.hospitalLocation}
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.district}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  Reason:
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {request.reason}
                </div>
              </div>

              {/* Requester Info */}
              <div className="mb-4 text-sm text-gray-600">
                <div className="font-semibold">Requested by:</div>
                <div>{request.requesterName || "Anonymous"}</div>
              </div>

              {/* Donor Info (active or fulfilled) */}
              {["active", "fulfilled"].includes(request.status) &&
                request.donorName &&
                canSeeDonorDetails(request) && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold text-blue-800">
                        {request.donorName.includes("Blood Bank")
                          ? "Assigned from Blood Bank"
                          : "Donor Assigned:"}
                      </div>
                      {request.donorName.includes("Blood Bank") && (
                        <span className="badge badge-sm badge-primary">Blood Bank</span>
                      )}
                    </div>
                    <div className="text-sm text-blue-700">
                      {request.donorName}
                    </div>
                    {request.donorPhone && request.donorPhone !== "N/A" && (
                      <div className="text-sm text-blue-700">
                        {request.donorPhone}
                      </div>
                    )}
                  </div>
                )}
                {/* onClick={(e) => e.stopPropagation()} */}
              {/* Actions - Row 1: Donate Blood and Blood Bank */}
              <div className="flex gap-4 mb-2">
                {request.status === "pending" && !isRequester(request) && (
                  <>
                    {isBloodGroupMatch(request.bloodGroup) ? (
                      <button
                        onClick={() => handleDonateClick(request)}
                        className="btn btn-xs sm:btn-sm bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex-1 whitespace-normal"
                      >
                        Donate Blood
                      </button>
                    ) : (
                      <button
                        disabled
                        title={`Blood group mismatch. Request: ${request.bloodGroup}, Your blood group: ${donorBloodGroup || "Not available"}`}
                        className="btn btn-xs sm:btn-sm bg-gray-400 text-white text-xs sm:text-sm flex-1 whitespace-normal cursor-not-allowed opacity-60"
                      >
                        ❌ Blood Group Mismatch
                      </button>
                    )}
                  </>
                )}

                {/* Admin: Blood Bank Donation Button */}
                {(userRole === "admin" || userRole === "Admin" || userRole === "executive") && request.status === "pending" && (
                  <button
                    onClick={() => handleBloodBankClick(request)}
                    className="btn btn-xs sm:btn-sm bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm flex-1 whitespace-normal gap-1"
                    title="Donate from Blood Bank Stock"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-4 sm:w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Bank
                  </button>
                )}

                {/* Requester Contact */}
                {request.status === "pending" && isRequester(request) && (
                  <button
                    onClick={() => handleContact(request.contactNumber)}
                    className="btn btn-xs sm:btn-sm bg-[#780A0A] hover:bg-[#a00b0b] text-white text-xs sm:text-sm flex-1 whitespace-normal gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
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
                    Call
                  </button>
                )}
              </div>

              {/* Actions - Row 2: Phone, Share, Delete */}
              <div className="flex gap-2">
                {request.status === "pending" && !isRequester(request) && (
                  <button
                    onClick={() => handleContact(request.contactNumber)}
                    className="btn btn-xs sm:btn-sm bg-[#780A0A] hover:bg-[#a00b0b] text-white text-xs sm:text-sm flex-1 gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
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
                    Phone
                  </button>
                )}

                {/* Share Button - Available for all users */}
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/blood-request/${request._id}`;
                    navigator.clipboard
                      .writeText(url)
                      .then(() => {
                        Swal.fire({
                          icon: "success",
                          title: "Link copied",
                          text: "Request link copied to clipboard",
                          timer: 1500,
                          showConfirmButton: false,
                          position: "top",
                        });
                      })
                      .catch(() => {
                        Swal.fire({
                          icon: "error",
                          title: "Copy failed",
                          text: "Could not copy link. Please copy manually.",
                        });
                      });
                  }}
                  className="btn btn-xs sm:btn-sm btn-ghost text-xs sm:text-sm flex-1 gap-1"
                  aria-label="Share request link"
                  title="Copy request link"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 sm:w-5 sm:h-5"
                  >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share
                </button>

                {/* Admin Delete */}
                {(userRole === "Admin" || userRole === "executive") && (
                  <button
                    onClick={() => handleDeleteRequest(request._id)}
                    className="btn btn-xs sm:btn-sm btn-error text-white text-xs sm:text-sm flex-1 gap-1"
                    title="Delete Request"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}

                {/* Admin: Mark Fulfilled */}
                {(userRole === "Admin" || userRole === "executive") && request.status === "active" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(request._id, "fulfilled")
                    }
                    className="btn btn-xs sm:btn-sm btn-success text-white text-xs sm:text-sm flex-1 gap-1"
                    title="Mark as Fulfilled"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Blood Bank Donation Modal */}
      {showBloodBankModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-96 overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Assign Blood from Blood Bank
            </h3>
            
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-semibold">Blood Type:</span>
                <span className="text-2xl font-bold text-[#780A0A]">
                  {selectedRequest.bloodGroup}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Hospital:</span>
                <span className="text-gray-600 font-semibold">{selectedRequest.hospitalName}</span>
              </div>
            </div>

            {availableBloodBags.length > 0 ? (
              <div className="space-y-4">
                {/* Select Blood Bag */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Select Blood Bag *</span>
                  </label>
                  {loadingBags ? (
                    <div className="select select-bordered w-full flex items-center justify-center">
                      <span className="loading loading-spinner loading-sm"></span>
                      Loading bags...
                    </div>
                  ) : (
                    <select
                      value={selectedBloodBag || ""}
                      onChange={(e) => {
                        const bagId = e.target.value;
                        setSelectedBloodBag(bagId);
                        const selectedBag = availableBloodBags.find(b => b._id === bagId);
                        if (selectedBag) {
                          setBankDonationUnits(selectedBag.units);
                        }
                      }}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">-- Select a blood bag --</option>
                      {availableBloodBags.map((bag) => (
                        <option key={bag._id} value={bag._id}>
                          {bag.bloodBagNumber} - {bag.donorName} ({bag.units} units)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Patient Information */}
                <div className="divider my-2">Patient Information</div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Patient Name *</span>
                  </label>
                  <input
                    type="text"
                    value={bankPatientInfo.patientName}
                    onChange={(e) =>
                      setBankPatientInfo({ ...bankPatientInfo, patientName: e.target.value })
                    }
                    className="input input-bordered w-full"
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Patient ID</span>
                  </label>
                  <input
                    type="text"
                    value={bankPatientInfo.patientId}
                    onChange={(e) =>
                      setBankPatientInfo({ ...bankPatientInfo, patientId: e.target.value })
                    }
                    className="input input-bordered w-full"
                    placeholder="Enter patient ID (optional)"
                  />
                </div>



                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Date Used *</span>
                  </label>
                  <input
                    type="date"
                    value={bankPatientInfo.dateUsed}
                    onChange={(e) =>
                      setBankPatientInfo({ ...bankPatientInfo, dateUsed: e.target.value })
                    }
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Notes</span>
                  </label>
                  <textarea
                    value={bankPatientInfo.notes}
                    onChange={(e) =>
                      setBankPatientInfo({ ...bankPatientInfo, notes: e.target.value })
                    }
                    className="textarea textarea-bordered w-full"
                    placeholder="Additional notes (optional)"
                    rows="2"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowBloodBankModal(false);
                      setSelectedRequest(null);
                      setBankDonationUnits(1);
                      setSelectedBloodBag(null);
                    }}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBloodBankDonation}
                    disabled={loading || !selectedBloodBag}
                    className="btn bg-purple-600 hover:bg-purple-700 text-white flex-1 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Assign Blood
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>No available blood bags for {selectedRequest.bloodGroup}</span>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BloodRequests;
