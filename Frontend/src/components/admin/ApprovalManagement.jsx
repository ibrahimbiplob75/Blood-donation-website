import { useState, useEffect } from "react";
import { baseURL } from "../../Hooks/useAxios";
import Swal from "sweetalert2";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Droplet,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";

const ApprovalManagement = () => {
  const [pendingDonations, setPendingDonations] = useState([]);
  const [pendingBloodRequests, setPendingBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("donations"); // donations or requests
  const [processingId, setProcessingId] = useState(null);
  const [showBloodBagModal, setShowBloodBagModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [bloodBagNumber, setBloodBagNumber] = useState("");
  const [bagModalLoading, setBagModalLoading] = useState(false);
  const [modalType, setModalType] = useState(""); // "donation" or "request"

  useEffect(() => {
    const controller = new AbortController();
    fetchPendingApprovals(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchWithRetry = async (url, options, retries = 2, delayMs = 500) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && retries > 0 && response.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return fetchWithRetry(url, options, retries - 1, delayMs * 2);
      }
      return response;
    } catch (error) {
      if (retries > 0 && error.name !== "AbortError") {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return fetchWithRetry(url, options, retries - 1, delayMs * 2);
      }
      throw error;
    }
  };

  const fetchPendingApprovals = async (signal) => {
    try {
      setLoading(true);
      setLoadError("");
      
      // Fetch pending donation requests
      const donationRequest = fetchWithRetry(
        `${baseURL}/donation-requests/admin/pending`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal,
        }
      );

      // Fetch pending blood requests
      const bloodRequest = fetchWithRetry(
        `${baseURL}/blood-requests/admin/pending`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          signal,
        }
      );

      const [donationsResult, requestsResult] = await Promise.allSettled([
        donationRequest,
        bloodRequest,
      ]);

      if (donationsResult.status === "fulfilled" && donationsResult.value.ok) {
        const donationsData = await donationsResult.value.json();
        setPendingDonations(donationsData.requests || []);
      } else if (donationsResult.status === "rejected" && donationsResult.reason?.name !== "AbortError") {
        setLoadError("Some approvals could not be loaded. Please try again.");
      }

      if (requestsResult.status === "fulfilled" && requestsResult.value.ok) {
        const requestsData = await requestsResult.value.json();
        setPendingBloodRequests(requestsData.requests || []);
      } else if (requestsResult.status === "rejected" && requestsResult.reason?.name !== "AbortError") {
        setLoadError("Some approvals could not be loaded. Please try again.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching pending approvals:", error);
        setLoadError("Failed to load pending approvals. Please retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  const approveDonation = async (donationId) => {
    // Show modal for blood bag number input for donation
    setSelectedDonationId(donationId);
    setBloodBagNumber("");
    setModalType("donation");
    setShowBloodBagModal(true);
  };

  const rejectDonation = async (donationId) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Donation",
      input: "textarea",
      inputLabel: "Reason for rejection (optional)",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#d33",
    });

    if (reason !== undefined) {
      try {
        setProcessingId(donationId);
        const response = await fetch(`${baseURL}/donation-requests/${donationId}/reject`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            reason: reason || "",
            adminEmail: "admin@example.com"
          }),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Rejected",
            text: "Donation request has been rejected",
            timer: 2000,
          });
          fetchPendingApprovals();
        } else {
          throw new Error("Failed to reject donation");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to reject donation",
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const approveBloodRequest = async (requestId) => {
    try {
      setProcessingId(requestId);
      const response = await fetch(`${baseURL}/blood-requests/${requestId}/approve`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminEmail: "admin@example.com"
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Approved!",
          text: "Blood request has been approved successfully",
          timer: 2000,
        });
        fetchPendingApprovals();
      } else {
        throw new Error("Failed to approve blood request");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to approve blood request",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const submitBloodBagApproval = async () => {
    if (!bloodBagNumber.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please enter a blood bag number",
      });
      return;
    }

    try {
      setBagModalLoading(true);
      
      if (modalType === "donation") {
        // Approve donation with blood bag number
        setProcessingId(selectedDonationId);
        const response = await fetch(`${baseURL}/donation-requests/${selectedDonationId}/approve`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            adminEmail: "admin@example.com",
            bloodBagNumber: bloodBagNumber.trim()
          }),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Approved!",
            text: `Donation approved and assigned blood bag #${bloodBagNumber.trim()}`,
            timer: 2000,
          });
          fetchPendingApprovals();
          setShowBloodBagModal(false);
          setBloodBagNumber("");
          setSelectedDonationId(null);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to approve donation");
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to process approval",
      });
    } finally {
      setBagModalLoading(false);
      setProcessingId(null);
      setModalType("");
    }
  };

  const rejectBloodRequest = async (requestId) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Blood Request",
      input: "textarea",
      inputLabel: "Reason for rejection (optional)",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#d33",
    });

    if (reason !== undefined) {
      try {
        setProcessingId(requestId);
        const response = await fetch(`${baseURL}/blood-requests/${requestId}/reject`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            reason: reason || "",
            adminEmail: "admin@example.com"
          }),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Rejected",
            text: "Blood request has been rejected",
            timer: 2000,
          });
          fetchPendingApprovals();
        } else {
          throw new Error("Failed to reject blood request");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to reject blood request",
        });
      } finally {
        setProcessingId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Clock className="text-orange-600" size={40} />
          Pending Approvals
        </h1>
        <p className="text-gray-600">Review and approve donor registrations and blood requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Donations</p>
              <p className="text-3xl font-bold text-blue-600">{pendingDonations.length}</p>
            </div>
            <Users className="text-blue-600" size={40} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Blood Requests</p>
              <p className="text-3xl font-bold text-red-600">{pendingBloodRequests.length}</p>
            </div>
            <Droplet className="text-red-600" size={40} />
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm">{loadError}</p>
          <button
            onClick={() => fetchPendingApprovals()}
            className="btn btn-sm btn-error text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-white shadow-md">
        <a
          className={`tab tab-lg ${activeTab === "donations" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("donations")}
        >
          <Users size={20} className="mr-2" />
          Pending Donations ({pendingDonations.length})
        </a>
        <a
          className={`tab tab-lg ${activeTab === "requests" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <Droplet size={20} className="mr-2" />
          Pending Blood Requests ({pendingBloodRequests.length})
        </a>
      </div>

      {/* Pending Donations Tab */}
      {activeTab === "donations" && (
        <div className="space-y-4">
          {pendingDonations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No pending donation requests</p>
            </div>
          ) : (
            pendingDonations.map((donation) => (
              <div key={donation._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Donor Name</p>
                    <p className="font-semibold text-lg">{donation.donorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Group</p>
                    <span className="badge badge-error badge-lg text-white">
                      {donation.bloodGroup}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{donation.donorEmail || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{donation.donorPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p className="font-medium">{donation.district || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="font-medium">{formatDate(donation.createdAt)}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Units</p>
                    <p className="font-medium">{donation.units} unit(s)</p>
                  </div>
                  {donation.weight && (
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{donation.weight} kg</p>
                    </div>
                  )}
                  {donation.medicalConditions && donation.medicalConditions !== "None" && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Medical Conditions</p>
                      <p className="font-medium text-orange-600">{donation.medicalConditions}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => approveDonation(donation._id)}
                    disabled={processingId === donation._id}
                    className="btn btn-success text-white gap-2 flex-1"
                  >
                    <CheckCircle size={20} />
                    Approve & Add to Stock
                  </button>
                  <button
                    onClick={() => rejectDonation(donation._id)}
                    disabled={processingId === donation._id}
                    className="btn btn-error gap-2 flex-1"
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Blood Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {pendingBloodRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No pending blood requests</p>
            </div>
          ) : (
            pendingBloodRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {request.requesterName || "Anonymous"}
                    </h3>
                    <p className="text-gray-500">{request.hospitalName}</p>
                  </div>
                  <span
                    className={`badge badge-lg ${
                      request.urgency === "emergency"
                        ? "badge-error"
                        : request.urgency === "urgent"
                        ? "badge-warning"
                        : "badge-info"
                    }`}
                  >
                    {request.urgency?.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Blood Group Needed</p>
                    <span className="badge badge-error badge-lg text-white">
                      {request.bloodGroup}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hospital Location</p>
                    <p className="font-medium">{request.hospitalLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{request.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{request.contactNumber}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="font-medium">{request.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium">{formatDate(request.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => approveBloodRequest(request._id)}
                    disabled={processingId === request._id}
                    className="btn btn-success text-white gap-2 flex-1"
                  >
                    <CheckCircle size={20} />
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => rejectBloodRequest(request._id)}
                    disabled={processingId === request._id}
                    className="btn btn-error gap-2 flex-1"
                  >
                    <XCircle size={20} />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Blood Bag Number Modal */}
      {showBloodBagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Assign Blood Bag Number</h2>
            <p className="text-gray-600 mb-6">
              {modalType === "donation" 
                ? "Please enter the blood bag number for this approved donation. This will be recorded in the donation history."
                : "Please enter the blood bag number for this approved blood request."}
            </p>
            
            <input
              type="text"
              placeholder="e.g., BAG-001-2024"
              value={bloodBagNumber}
              onChange={(e) => setBloodBagNumber(e.target.value)}
              className="input input-bordered w-full mb-6"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  submitBloodBagApproval();
                }
              }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBloodBagModal(false);
                  setBloodBagNumber("");
                  setSelectedRequestId(null);
                  setSelectedDonationId(null);
                  setModalType("");
                }}
                disabled={bagModalLoading}
                className="btn btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={submitBloodBagApproval}
                disabled={bagModalLoading || !bloodBagNumber.trim()}
                className="btn btn-success text-white flex-1"
              >
                {bagModalLoading ? "Processing..." : "Assign & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalManagement;
