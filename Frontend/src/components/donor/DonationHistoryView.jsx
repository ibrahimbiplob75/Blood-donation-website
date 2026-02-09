import { useState, useEffect } from "react";
import { baseURL } from "../../Hooks/useAxios";
import Swal from "sweetalert2";
import {
  CheckCircle,
  AlertCircle,
  Droplet,
  Calendar,
  User,
  Award,
  Filter,
  Download
} from "lucide-react";

const DonationHistoryView = () => {
  const [donationRecords, setDonationRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterEligibility, setFilterEligibility] = useState(""); // all, eligible, ineligible
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [donationRecords, searchTerm, filterBloodGroup, filterEligibility]);

  const fetchDonationHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/donation-history`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setDonationRecords(data.records || []);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch donation history"
        });
      }
    } catch (error) {
      console.error("Error fetching donation history:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to connect to server"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...donationRecords];

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.bloodBagNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBloodGroup) {
      filtered = filtered.filter((record) => record.bloodGroup === filterBloodGroup);
    }

    if (filterEligibility === "eligible") {
      filtered = filtered.filter((record) => record.eligibility?.isEligible);
    } else if (filterEligibility === "ineligible") {
      filtered = filtered.filter((record) => !record.eligibility?.isEligible);
    }

    setFilteredRecords(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getEligibilityBadge = (eligibility) => {
    if (!eligibility) return null;

    return (
      <div
        className={`badge ${
          eligibility.isEligible
            ? "badge-success"
            : "badge-error"
        }`}
      >
        {eligibility.isEligible ? "Eligible" : "Not Eligible"}
      </div>
    );
  };

  const getEligibilityDetails = (eligibility) => {
    if (!eligibility) return null;

    return (
      <div className="mt-3 pt-3 border-t">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold w-32">Checked At:</span>
            <span>{formatDate(eligibility.checkedAt)}</span>
          </div>
          {eligibility.checks?.age && (
            <div className="flex items-center gap-2">
              <span className="font-semibold w-32">Age:</span>
              <span>{eligibility.checks.age} years</span>
            </div>
          )}
          {eligibility.checks?.weight && (
            <div className="flex items-center gap-2">
              <span className="font-semibold w-32">Weight:</span>
              <span>{eligibility.checks.weight} kg</span>
            </div>
          )}
          {eligibility.checks?.daysSinceLastDonation !== undefined && (
            <div className="flex items-center gap-2">
              <span className="font-semibold w-32">Days Since Last:</span>
              <span>{eligibility.checks.daysSinceLastDonation} days</span>
            </div>
          )}

          {eligibility.ineligibilityReasons?.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <p className="font-semibold text-red-700 mb-1">Ineligibility Reasons:</p>
              <ul className="list-disc list-inside text-red-600 text-xs space-y-1">
                {eligibility.ineligibilityReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {eligibility.warningMessages?.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="font-semibold text-yellow-700 mb-1">Warnings:</p>
              <ul className="list-disc list-inside text-yellow-600 text-xs space-y-1">
                {eligibility.warningMessages.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Award className="text-red-600" size={40} />
          Donation History
        </h1>
        <p className="text-gray-600">
          View complete donation records with eligibility information
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Donations</p>
          <p className="text-3xl font-bold text-blue-600">{donationRecords.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Eligible Donors</p>
          <p className="text-3xl font-bold text-green-600">
            {donationRecords.filter(r => r.eligibility?.isEligible).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Ineligible Donors</p>
          <p className="text-3xl font-bold text-red-600">
            {donationRecords.filter(r => !r.eligibility?.isEligible).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Total Units Donated</p>
          <p className="text-3xl font-bold text-orange-600">
            {donationRecords.reduce((sum, r) => sum + (r.unitsGiven || 0), 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Filter size={20} />
          Filter Records
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Search</label>
            <input
              type="text"
              placeholder="Blood bag #, patient name, hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Blood Group</label>
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Eligibility</label>
            <select
              value={filterEligibility}
              onChange={(e) => setFilterEligibility(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">All Eligibility Status</option>
              <option value="eligible">Eligible</option>
              <option value="ineligible">Not Eligible</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterBloodGroup("");
                setFilterEligibility("");
              }}
              className="btn btn-outline w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Records */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No donation records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record._id} className="bg-white rounded-lg shadow p-6">
              {/* Header Row */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    <span className="flex items-center gap-2">
                      <Droplet size={24} className="text-red-600" />
                      Blood Bag #{record.bloodBagNumber}
                    </span>
                  </h3>
                  <p className="text-gray-600 mt-2">{record.patientName || "Unknown Patient"}</p>
                </div>
                <div className="text-right">
                  {getEligibilityBadge(record.eligibility)}
                  <p className="text-sm text-gray-500 mt-2">{record.status}</p>
                </div>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <span className="badge badge-error text-white badge-lg">
                    {record.bloodGroup}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Units Given</p>
                  <p className="font-semibold">{record.unitsGiven} unit(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium">{record.hospitalName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approval Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(record.approvalDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved By</p>
                  <p className="font-medium">{record.approvedBy || "Admin"}</p>
                </div>
                {record.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="font-medium text-sm">{record.notes}</p>
                  </div>
                )}
              </div>

              {/* Eligibility Details */}
              {record.eligibility && (
                <div className={`p-4 rounded-lg ${
                  record.eligibility.isEligible
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {record.eligibility.isEligible ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600" size={20} />
                    )}
                    <h4 className={`font-bold ${
                      record.eligibility.isEligible
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}>
                      {record.eligibility.isEligible
                        ? 'Donor is Eligible'
                        : 'Donor is Not Eligible'}
                    </h4>
                  </div>
                  {getEligibilityDetails(record.eligibility)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {filteredRecords.length > 0 && (
        <div className="mt-8 text-center text-gray-600 text-sm">
          Showing {filteredRecords.length} of {donationRecords.length} records
        </div>
      )}
    </div>
  );
};

export default DonationHistoryView;
