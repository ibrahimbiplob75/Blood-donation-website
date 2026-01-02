import { useState, useEffect, useContext } from "react";
import { AuthProvider } from "../../context/ContextProvider.jsx";
import AxiosPublic from "../../context/AxiosPublic.jsx";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const BloodRequests = () => {
  const { user, userRole } = useContext(AuthProvider);
  const [publicAxios] = AxiosPublic();

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  const handleDonateClick = (request) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to donate blood",
      });
      return;
    }
    setSelectedRequest(request);
    setShowDonateModal(true);
  };

  const handleConfirmDonate = async () => {
    try {
      let donorName, donorPhone;

      if (userRole === "admin" || userRole === "executive") {
        donorName = "Blood Bank";
        // Fetch admin phone from user data
        const userResponse = await publicAxios.get(
          `/users?email=${user.email}`
        );
        donorPhone = userResponse.data[0]?.phone || "Not Available";
      } else {
        // Regular user
        const userResponse = await publicAxios.get(
          `/users?email=${user.email}`
        );
        donorName =
          userResponse.data[0]?.Name || user.displayName || "Anonymous";
        donorPhone = userResponse.data[0]?.phone || "Not Available";
      }

      await publicAxios.put(`/blood-requests/${selectedRequest._id}/status`, {
        status: "active",
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
    if (userRole !== "admin" && userRole !== "executive") {
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
        await publicAxios.put(`/blood-requests/${requestId}/status`, {
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
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow"
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
                <div className="text-right text-xs text-gray-500">
                  {formatDate(request.createdAt)}
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

              {/* Donor Info (if active) */}
              {request.status === "active" && request.donorName && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-800 mb-1">
                    Donor Assigned:
                  </div>
                  <div className="text-sm text-blue-700">
                    {request.donorName}
                  </div>
                  <div className="text-sm text-blue-700">
                    {request.donorPhone}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleDonateClick(request)}
                      className="btn btn-sm bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      Donate Blood
                    </button>
                    <button
                      onClick={() => handleContact(request.contactNumber)}
                      className="btn btn-sm bg-[#780A0A] hover:bg-[#a00b0b] text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </button>
                  </>
                )}

                {/* Admin Actions */}
                {(userRole === "Admin" || userRole === "executive") && (
                  <>
                    {request.status === "active" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(request._id, "fulfilled")
                        }
                        className="btn btn-sm btn-success text-white"
                        title="Mark as Fulfilled"
                      >
                       Ok 
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRequest(request._id)}
                      className="btn btn-sm btn-error text-white"
                      title="Delete Request"
                    >
                      X
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BloodRequests;
