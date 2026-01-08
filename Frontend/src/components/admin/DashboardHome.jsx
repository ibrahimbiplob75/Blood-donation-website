import {
  Droplets,
  Heart,
  Users,
  Activity,
  Calendar,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import {
  FaHeartbeat,
  FaTint,
  FaUserPlus,
  FaCheckCircle,
  FaHospital,
  FaClock,
} from "react-icons/fa";
import { baseURL } from "../../Hooks/useAxios.js";
import { AuthProvider } from "../../context/ContextProvider.jsx";

const StatCard = ({ title, value, icon, loading, color = "red" }) => {
  const colorClasses = {
    red: "text-red-700",
    green: "text-green-700",
    blue: "text-blue-700",
    orange: "text-orange-700",
    purple: "text-purple-700",
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center h-56 w-80 border border-gray-200 hover:shadow-xl transition-all">
      {icon && (
        <div className={`text-4xl mb-2 ${colorClasses[color]}`}>{icon}</div>
      )}
      <h2 className="text-lg font-medium text-gray-700">{title}</h2>
      <p className="text-4xl font-bold text-gray-900 mt-4">
        {loading ? "Loading..." : value}
      </p>
    </div>
  );
};

const TableCard = ({ title, columns, data, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-80 h-56 overflow-auto border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      {loading ? (
        <div className="flex items-center justify-center h-40">...</div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          No data
        </div>
      ) : (
        <table className="text-sm w-full">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="text-left border-b pb-1 font-medium text-gray-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="py-2 border-b text-gray-600">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const BloodTypeCard = ({ bloodType, count, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center justify-center h-28 w-36 border-2 border-red-200 hover:border-red-400 hover:shadow-xl transition-all">
      <div className="text-3xl font-bold text-red-600 mb-1">{bloodType}</div>
      <div className="text-xs text-gray-500 mb-1">Available Donors</div>
      <div className="text-2xl font-bold text-gray-900">
        {loading ? "..." : count}
      </div>
    </div>
  );
};

export default function DashboardHome() {
  const [userName, setUserName] = useState("");
  const [totalDonors, setTotalDonors] = useState(0);
  const [activeDonors, setActiveDonors] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [thisMonthDonations, setThisMonthDonations] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeRequests, setActiveRequests] = useState(0);
  const [fulfilledRequests, setFulfilledRequests] = useState(0);
  const [cancelledRequests, setCancelledRequests] = useState(0);
  const [bloodStock, setBloodStock] = useState({});
  const [donorStats, setDonorStats] = useState([]);
  const [branchStats, setBranchStats] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userRole } = useContext(AuthProvider);

  const isAdminUser = (userRole) => {
    if (!userRole) return false;
    try {
      return userRole.toString().toLowerCase() === "admin";
    } catch (e) {
      return false;
    }
  };

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
    };
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const dashboardRes = await fetch(`${baseURL}/admin/dashboard-stats`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();

        setTotalDonors(data.totalDonors || 0);
        setActiveDonors(data.activeDonors || 0);
        setTotalDonations(data.totalDonations || 0);
        setThisMonthDonations(data.thisMonthDonations || 0);
        setPendingRequests(data.pendingRequests || 0);
        setActiveRequests(data.activeRequests || 0);
        setFulfilledRequests(data.fulfilledRequests || 0);
        setCancelledRequests(data.cancelledRequests || 0);

        setBloodStock(
          data.bloodStock || {
            "A+": 0,
            "A-": 0,
            "B+": 0,
            "B-": 0,
            "AB+": 0,
            "AB-": 0,
            "O+": 0,
            "O-": 0,
          }
        );

        const donorStatsArray = (data.donorStats || []).map((s) => ({
          "Blood Type": s.bloodType,
          "Total Donors": s.count,
        }));
        setDonorStats(donorStatsArray);

        const branchStatsArray = (data.branchStats || []).map((b) => ({
          District: b.branch,
          "Pending Requests": b.count,
        }));
        setBranchStats(branchStatsArray);

        const recentDonationsArray = (data.recentDonations || []).map((d) => ({
          Donor: d.donorName,
          "Blood Type": d.bloodType,
          Date: d.date,
        }));
        setRecentDonations(recentDonationsArray);

        const urgentRequestsArray = (data.urgentRequests || []).map((r) => ({
          "Blood Type": r.bloodType,
          Hospital: r.hospital,
          Status: r.status,
        }));
        setUrgentRequests(urgentRequestsArray);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-red-50 to-gray-50">
      <div className="flex flex-col justify-center items-center mb-6">
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-lg bg-white rounded-lg shadow-lg px-6 py-4 border border-red-100">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            <span className="text-gray-600">Name:</span>
            <span className="text-red-600 font-medium">
              {user?.displayName || userName}
            </span>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-600" />
            <span className="text-gray-600">Role:</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium text-sm">
              {userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Blood Stock by Type */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Droplets className="text-red-600" />
          Available Blood Donors by Type
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.entries(bloodStock).map(([type, count]) => (
            <BloodTypeCard
              key={type}
              bloodType={type}
              count={count}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Donor Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="text-red-600" />
          User Overview
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <StatCard
            title="Total Registered Donors"
            value={totalDonors}
            icon={<FaUserPlus />}
            loading={loading}
            color="red"
          />
          <StatCard
            title="Active Donors"
            value={activeDonors}
            icon={<FaHeartbeat />}
            loading={loading}
            color="green"
          />
          {isAdminUser(userRole) && (
            <TableCard
              title="Donors by Blood Type"
              columns={["Blood Type", "Total Donors"]}
              data={donorStats}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Donation Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="text-red-600" />
          Donation Activity
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <StatCard
            title="Total Donations"
            value={totalDonations}
            icon={<FaTint />}
            loading={loading}
            color="blue"
          />
          <StatCard
            title="This Month"
            value={thisMonthDonations}
            icon={<Calendar />}
            loading={loading}
            color="green"
          />
          {isAdminUser(userRole) && (
            <TableCard
              title="Recent Donations"
              columns={["Donor", "Blood Type", "Date"]}
              data={recentDonations}
              loading={loading}
            />
          )}
          {isAdminUser(userRole) && (
            <TableCard
              title="District Requests"
              columns={["District", "Pending Requests"]}
              data={branchStats}
              loading={loading}
            />
          )}
        </div>
      </div>

      {/* Requests & Emergency */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaHospital className="text-red-600" />
          Blood Requests
        </h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <StatCard
            title="Pending Requests"
            value={pendingRequests}
            icon={<FaClock />}
            loading={loading}
            color="orange"
          />
          <StatCard
            title="Active Donations"
            value={activeRequests}
            icon={<Activity />}
            loading={loading}
            color="blue"
          />
          <StatCard
            title="Fulfilled Requests"
            value={fulfilledRequests}
            icon={<FaCheckCircle />}
            loading={loading}
            color="green"
          />
          <TableCard
            title="Urgent Requests"
            columns={["Blood Type", "Hospital", "Status"]}
            data={urgentRequests}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
