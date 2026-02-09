import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosPublic from "../context/AxiosPublic.jsx";
import useAxios from "../Hooks/useAxios.js";
import { AuthProvider } from "../context/ContextProvider.jsx";
import Swal from "sweetalert2";

const BloodRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publicAxios] = AxiosPublic();
  const secureAxios = useAxios();
  const { user, userRole } = useContext(AuthProvider);
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showBloodBankModal, setShowBloodBankModal] = useState(false);
  const [bloodStock, setBloodStock] = useState({});
  const [bankDonationUnits, setBankDonationUnits] = useState(1);
  const [donorBloodGroup, setDonorBloodGroup] = useState(null);
  const [donorBloodGroupLoading, setDonorBloodGroupLoading] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);
  useEffect(() => {
    if (user) {
      fetchDonorBloodGroup();
    }
  }, [user]);

  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicAxios.get(`/blood-requests/${id}`);
      
      if (response.data) {
        setRequest(response.data);
      } else {
        setError("Blood request not found");
      }
    } catch (err) {
      console.error("Error fetching blood request:", err);
      setError(err.response?.data?.message || "Failed to load blood request details");
    } finally {
      setLoading(false);
    }
  };
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
  const isBloodGroupMatch = (requestBloodGroup) => {
    if (!donorBloodGroup) return false;
    return donorBloodGroup === requestBloodGroup;
  };
  const handleContact = () => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to contact the requester",
        icon: "info",
        confirmButtonText: "Login",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    // Direct call to contact number
    if (request.contactNumber) {
      window.location.href = `tel:${request.contactNumber}`;
    }
  };
  const handleDonateClick = () => {
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

    setShowDonateModal(true);
  };
  const handleConfirmDonate = async () => {
    try {
      let donorName, donorPhone;

      if (userRole === "admin" || userRole === "Admin" || userRole === "executive") {
        donorName = "Blood Bank";
        const userResponse = await secureAxios.get(`/users?email=${user.email}`);
        donorPhone = userResponse.data[0]?.phone || "Not Available";
      } else {
        const userResponse = await secureAxios.get(`/users?email=${user.email}`);
        donorName = userResponse.data[0]?.Name || user.displayName || "Anonymous";
        donorPhone = userResponse.data[0]?.phone || "Not Available";
      }

      await secureAxios.put(`/blood-requests/${request._id}/donate`, {
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
      fetchRequestDetail();
    } catch (error) {
      console.error("Error confirming donation:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error?.response?.data?.message || "Server error",
      });
    }
  };

  const fetchBloodStock = async () => {
    try {
      const response = await publicAxios.get("/admin/all-blood-stock");
      if (response.data.success && response.data.stock) {
        setBloodStock(response.data.stock);
      } else {
        const emptyStock = {};
        bloodGroups.forEach(group => {
          emptyStock[group] = 0;
        });
        setBloodStock(emptyStock);
      }
    } catch (error) {
      console.error("Error fetching blood stock:", error);
      const emptyStock = {};
      bloodGroups.forEach(group => {
        emptyStock[group] = 0;
      });
      setBloodStock(emptyStock);
    }
  };

  const handleBloodBankClick = async () => {
    await fetchBloodStock();
    setBankDonationUnits(1);
    setShowBloodBankModal(true);
  };

  const handleConfirmBloodBankDonation = async () => {
    if (!bankDonationUnits || bankDonationUnits <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please enter valid units",
      });
      return;
    }

    const availableUnits = bloodStock[request.bloodGroup] || 0;
    if (availableUnits < bankDonationUnits) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Stock",
        text: `Only ${availableUnits} unit(s) available in stock`,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await secureAxios.put(
        `/blood-requests/${request._id}/donate-from-bank`,
        {
          units: parseInt(bankDonationUnits),
          adminEmail: user?.email,
          adminName: user?.name || user?.displayName,
        }
      );

      if (response.data) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Successfully donated ${bankDonationUnits} unit(s) from blood bank`,
          timer: 2000,
        });

        setShowBloodBankModal(false);
        setBankDonationUnits(1);
        fetchRequestDetail();
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

  const handleStatusUpdate = async (newStatus) => {
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
        await secureAxios.put(`/blood-requests/${request._id}/status`, {
          status: newStatus,
          fulfilledBy: user?.email || "",
        });

        Swal.fire({
          icon: "success",
          title: "Status Updated",
          showConfirmButton: false,
          timer: 1500,
        });

        fetchRequestDetail();
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

  const handleDeleteRequest = async () => {
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
        await publicAxios.delete(`/blood-requests/${request._id}`);

        Swal.fire({
          icon: "success",
          title: "Deleted",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/blood-requests");
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

  const isRequester = () => {
    if (!user) return false;
    return request.requesterEmail === user.email;
  };

  const canSeeDonorDetails = () => {
    if (!user) return false;
    if (userRole === "admin" || userRole === "Admin" || userRole === "executive") return true;
    if (request.requesterEmail === user.email) return true;
    if (request.fulfilledBy === user.email) return true;
    return false;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-100 text-red-800 border-red-300";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "fulfilled":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-error"></span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">⚠️ Request Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "This blood request doesn't exist or has been removed."}</p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-error"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-2 sm:py-12">
      <div className="max-w-4xl mx-auto px-2 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-xs sm:btn-sm mb-2 sm:mb-6 gap-1 text-xs sm:text-sm h-8 sm:h-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-2 sm:p-8 text-white">
            <div className="flex flex-col gap-1 sm:gap-3">
              <div>
                <h1 className="text-lg sm:text-4xl font-bold mb-0 sm:mb-1">Blood Request</h1>
                <p className="text-red-100 text-xs sm:text-sm">Request ID: {request._id?.slice(-8) || "N/A"}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-start">
                {/* <div className="bg-white text-red-600 rounded-full p-2 sm:p-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-8 sm:w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div> */}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-2 sm:p-8">
            {/* Status and Urgency Badges */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-6">
              <span
                className={`px-2 sm:px-4 py-1 rounded-full border-2 font-semibold text-xs sm:text-sm ${getUrgencyColor(
                  request.urgency
                )}`}
              >
                🚨 {request.urgency ? request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1) : "Normal"}
              </span>
              <span
                className={`px-2 sm:px-4 py-1 rounded-full border-2 font-semibold text-xs sm:text-sm ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : "Pending"}
              </span>
            </div>

            {/* Blood Group Display */}
            <div className="mb-3 sm:mb-8 text-center py-2 sm:py-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl border-2 border-red-200">
              <p className="text-gray-600 text-xs sm:text-sm mb-1 font-semibold">Blood Group Required</p>
              <p className="text-3xl sm:text-6xl font-bold text-red-600 animate-pulse">
                {request.bloodGroup || "Not specified"}
              </p>
              {request.unitsNeeded && (
                <p className="text-gray-700 mt-1 sm:mt-3 text-xs sm:text-lg">
                  <strong>Units Needed:</strong> {request.unitsNeeded}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6 mb-3 sm:mb-8">
              {/* Hospital Information */}
              <div className="bg-gray-50 p-2 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
                <h3 className="text-xs sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-5 sm:w-5 text-red-600"
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
                  Hospital
                </h3>
                <div className="space-y-0 sm:space-y-2 text-xs">
                  <p className="text-xs">
                    <strong className="text-gray-700">Name:</strong>{" "}
                    <span className="text-gray-600 break-words text-xs">{request.hospitalName || "N/A"}</span>
                  </p>
                  {request.district && (
                    <p className="text-xs">
                      <strong className="text-gray-700">District:</strong>{" "}
                      <span className="text-gray-600 text-xs">{request.district}</span>
                    </p>
                  )}
                  {request.location && (
                    <p className="text-xs">
                      <strong className="text-gray-700">Location:</strong>{" "}
                      <span className="text-gray-600 break-words text-xs">{request.location}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 p-2 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
                <h3 className="text-xs sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-5 sm:w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Patient
                </h3>
                <div className="space-y-0 sm:space-y-2 text-xs">
                  <p className="text-xs">
                    <strong className="text-gray-700">Name:</strong>{" "}
                    <span className="text-gray-600 break-words text-xs">{request.patientName || "N/A"}</span>
                  </p>
                  {request.patientAge && (
                    <p className="text-xs">
                      <strong className="text-gray-700">Age:</strong>{" "}
                      <span className="text-gray-600 text-xs">{request.patientAge}y</span>
                    </p>
                  )}
                  {request.patientGender && (
                    <p className="text-xs">
                      <strong className="text-gray-700">Gender:</strong>{" "}
                      <span className="text-gray-600 text-xs">{request.patientGender}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gray-50 p-2 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
                <h3 className="text-xs sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-5 sm:w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Request
                </h3>
                <div className="space-y-0 sm:space-y-2 text-xs">
                  <p className="text-xs">
                    <strong className="text-gray-700">By:</strong>{" "}
                    <span className="text-gray-600 break-words text-xs">{request.requesterName || "Anonymous"}</span>
                  </p>
                  {request.createdAt && (
                    <p className="text-xs">
                      <strong className="text-gray-700">Date:</strong>{" "}
                      <span className="text-gray-600 text-xs">
                        {new Date(request.createdAt).toLocaleDateString("en-US", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </p>
                  )}
                  {request.neededDate && (
                    <p className="text-xs">
                      <strong className="text-gray-700">Needed:</strong>{" "}
                      <span className="text-gray-600 text-xs">
                        {new Date(request.neededDate).toLocaleDateString("en-US", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {request.reason && (
                <div className="bg-gray-50 p-2 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
                  <h3 className="text-xs sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-3 flex items-center gap-1 sm:gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-5 sm:w-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Notes
                  </h3>
                  <p className="text-xs text-gray-600 break-words">{request.reason}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-6 border-t border-gray-200">
              {/* Donor Info Display */}
              {["active", "fulfilled"].includes(request.status) &&
                request.donorName &&
                canSeeDonorDetails() && (
                  <div className="p-2 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <div className="text-xs font-semibold text-blue-800">
                        {request.donorName.includes("Blood Bank")
                          ? "Bank"
                          : "Donor:"}
                      </div>
                      {request.donorName.includes("Blood Bank") && (
                        <span className="badge badge-xs badge-primary text-xs">Bank</span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700 break-words">
                      {request.donorName}
                    </div>
                    {request.donorPhone && request.donorPhone !== "N/A" && (
                      <div className="text-xs sm:text-sm text-blue-700 break-all">
                        {request.donorPhone}
                      </div>
                    )}
                  </div>
                )}

              {/* Action Buttons - Row 1: Donate Blood and Blood Bank */}
              <div className="flex gap-1 flex-wrap">
                {request.status === "pending" && !isRequester() && (
                  <>
                    {isBloodGroupMatch(request.bloodGroup) ? (
                      <button
                        onClick={handleDonateClick}
                        className="btn btn-xs bg-green-600 hover:bg-green-700 text-white text-xs flex-1 min-w-[80px] whitespace-normal h-auto py-1.5"
                      >
                        Donate
                      </button>
                    ) : (
                      <button
                        disabled
                        title={`Mismatch: ${request.bloodGroup} needed`}
                        className="btn btn-xs bg-gray-400 text-white text-xs flex-1 min-w-[80px] whitespace-normal h-auto py-1.5 cursor-not-allowed opacity-60"
                      >
                        ❌ No
                      </button>
                    )}
                  </>
                )}

                {/* Admin: Blood Bank Donation Button */}
                {(userRole === "Admin" || userRole === "executive") && request.status === "pending" && (
                  <button
                    onClick={handleBloodBankClick}
                    className="btn btn-xs bg-purple-600 hover:bg-purple-700 text-white text-xs flex-1 min-w-[70px] whitespace-normal h-auto py-1.5 gap-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2.5 w-2.5"
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
                {isRequester() && request.status === "pending" && (
                  <button
                    onClick={handleContact}
                    className="btn btn-xs bg-[#780A0A] hover:bg-[#a00b0b] text-white text-xs flex-1 min-w-[70px] whitespace-normal h-auto py-1.5 gap-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2.5 w-2.5"
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

              {/* Action Buttons - Row 2: Phone, Share, Delete */}
              <div className="flex gap-2 flex-wrap">
                {request.status === "pending" && !isRequester() && (
                  <button
                    onClick={handleContact}
                    className="btn btn-xs sm:btn-sm bg-[#780A0A] hover:bg-[#a00b0b] text-white text-xs sm:text-sm flex-1 min-w-[100px] whitespace-normal h-auto py-2 gap-1"
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

                {/* Share Button */}
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
                  className="btn btn-xs sm:btn-sm btn-ghost text-xs sm:text-sm flex-1 min-w-[100px] whitespace-normal h-auto py-2 gap-1"
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
                    className="w-3 h-3"
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
                    onClick={handleDeleteRequest}
                    className="btn btn-xs sm:btn-sm btn-error text-white text-xs sm:text-sm flex-1 min-w-[100px] whitespace-normal h-auto py-2 gap-1"
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
                  </button>
                )}

                {/* Admin: Mark Fulfilled */}
                {(userRole === "Admin" || userRole === "executive") && request.status === "active" && (
                  <button
                    onClick={() => handleStatusUpdate("fulfilled")}
                    className="btn btn-xs sm:btn-sm btn-success text-white text-xs sm:text-sm flex-1 min-w-[100px] whitespace-normal h-auto py-2 gap-1"
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

              {/* Full Width Buttons */}
              <button
                onClick={() => navigate("/blood-requests")}
                className="btn btn-outline w-full text-xs sm:text-sm gap-2 h-auto py-2"
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-2 sm:mt-8 p-2 sm:p-6 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
          <h3 className="text-xs sm:text-lg font-semibold text-blue-900 mb-1">💡 Help</h3>
          <p className="text-xs text-blue-800 leading-tight">
            Contact requester if you can donate. Confirm eligibility & availability.
          </p>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl max-w-md w-full p-3 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base sm:text-2xl font-bold text-[#780A0A] mb-2 sm:mb-4">
              {userRole === "Admin" || userRole === "executive"
                ? "Blood Bank Donation"
                : "Confirm Donation"}
            </h2>

            <div className="mb-3 sm:mb-6 space-y-1 sm:space-y-3">
              <p className="text-xs sm:text-base text-gray-700">
                <strong>Blood:</strong> <span className="text-red-600 font-semibold text-sm">{request?.bloodGroup}</span>
              </p>
              <p className="text-xs sm:text-base text-gray-700">
                <strong>Hospital:</strong> <span className="break-words text-xs">{request?.hospitalName}</span>
              </p>
              <p className="text-xs sm:text-base text-gray-700">
                <strong>Urgency:</strong>
                <span
                  className={`badge badge-xs sm:badge-sm ml-2 ${
                    request?.urgency === "emergency"
                      ? "badge-error"
                      : request?.urgency === "urgent"
                      ? "badge-warning"
                      : "badge-ghost"
                  }`}
                >
                  {request?.urgency}
                </span>
              </p>

              {userRole === "admin" || userRole === "executive" ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded text-xs">
                  <p className="text-blue-800 font-semibold">
                    Will be marked as Blood Bank donation.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded text-xs">
                  <p className="text-green-800 font-semibold">
                    Your info will be shared with requester.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleConfirmDonate}
                className="btn btn-xs sm:btn-md bg-[#780A0A] hover:bg-[#a00b0b] text-white flex-1 h-auto py-2"
              >
                Yes, accept
              </button>
              <button
                onClick={() => setShowDonateModal(false)}
                className="btn btn-xs sm:btn-md btn-outline flex-1 h-auto py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blood Bank Donation Modal */}
      {showBloodBankModal && request && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-2xl p-3 sm:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">
              Blood Bank Donation
            </h3>
            
            <div className="mb-3 sm:mb-4 p-2 sm:p-4 bg-red-50 rounded-lg border border-red-200 space-y-1 sm:space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-base text-gray-700 font-semibold">Blood:</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#780A0A]">
                  {request.bloodGroup}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-base text-gray-700 font-semibold">Stock:</span>
                <span className="text-lg sm:text-2xl font-bold text-green-600">
                  {bloodStock[request.bloodGroup] || 0}
                </span>
              </div>
            </div>

            <div className="mb-3 sm:mb-4 space-y-1 text-xs">
              <div className="text-gray-600">
                <strong>Hospital:</strong> <span className="break-words text-xs">{request.hospitalName}</span>
              </div>
              <div className="text-gray-600">
                <strong>Patient:</strong> <span className="break-words text-xs">{request.requesterName}</span>
              </div>
              <div className="text-gray-600">
                <strong>Urgency:</strong>{" "}
                <span
                  className={`badge badge-xs ${
                    request.urgency === "emergency"
                      ? "badge-error"
                      : request.urgency === "urgent"
                      ? "badge-warning"
                      : "badge-ghost"
                  }`}
                >
                  {request.urgency}
                </span>
              </div>
            </div>

            {bloodStock[request.bloodGroup] > 0 ? (
              <>
                <div className="form-control mb-3 sm:mb-4">
                  <label className="label py-0 px-0">
                    <span className="label-text font-semibold text-xs">Units:</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={bloodStock[request.bloodGroup]}
                    value={bankDonationUnits}
                    onChange={(e) => setBankDonationUnits(parseInt(e.target.value) || 1)}
                    className="input input-bordered input-xs w-full"
                    placeholder="Units"
                  />
                  <label className="label py-1 px-0">
                    <span className="label-text-alt text-gray-500 text-xs">
                      Max: {bloodStock[request.bloodGroup]}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleConfirmBloodBankDonation}
                    disabled={loading || bankDonationUnits <= 0 || bankDonationUnits > bloodStock[request.bloodGroup]}
                    className="btn btn-xs sm:btn-md bg-purple-600 hover:bg-purple-700 text-white flex-1 disabled:opacity-50 gap-1 h-auto py-2"
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Ing...
                      </>
                    ) : (
                      <>
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
                        Confirm
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowBloodBankModal(false);
                      setBankDonationUnits(1);
                    }}
                    disabled={loading}
                    className="btn btn-xs sm:btn-md btn-outline flex-1 h-auto py-2"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="alert alert-error mb-4 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm">No {request.bloodGroup} blood available in stock!</span>
                </div>
                <button
                  onClick={() => {
                    setShowBloodBankModal(false);
                    setBankDonationUnits(1);
                  }}
                  className="btn btn-sm sm:btn-md btn-outline w-full"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodRequestDetail;
