import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../Hooks/useAxios.js";
import Swal from "sweetalert2";

const Statistics = () => {
  const navigate = useNavigate();
  const axios = useAxios();
  
  const [stats, setStats] = useState({
    activeDonors: 0,
    patientsHelped: 0,
    unitsDonated: 0,
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get("/admin/statistics");
      if (response.data.success && response.data.data) {
        setStats({
          activeDonors: response.data.data.activeDonors || 0,
          patientsHelped: response.data.data.patientsHelped || 0,
          unitsDonated: response.data.data.unitsDonated || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load statistics",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStats({
      ...stats,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put("/admin/statistics", {
        activeDonors: parseInt(stats.activeDonors),
        patientsHelped: parseInt(stats.patientsHelped),
        unitsDonated: parseInt(stats.unitsDonated),
      });

      if (response.data.success) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Statistics updated successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to update statistics:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to update statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <svg
            className="h-12 w-12 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            📊 Statistics Management
          </h1>
          <p className="text-gray-600 text-lg">
            Update the website statistics displayed on the home page
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Active Donors */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                🩸 Active Donors
              </label>
              <input
                type="number"
                name="activeDonors"
                value={stats?.activeDonors}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Enter number of active donors"
                required
              />
              <p className="text-gray-500 text-xs mt-1">
                Total number of active blood donors
              </p>
            </div>

            {/* Patients Helped */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                👥 Patients Helped
              </label>
              <input
                type="number"
                name="patientsHelped"
                value={stats?.patientsHelped}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Enter number of patients helped"
                required
              />
              <p className="text-gray-500 text-xs mt-1">
                Total number of patients helped
              </p>
            </div>

            {/* Units Donated */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                📦 Units Donated
              </label>
              <input
                type="number"
                name="unitsDonated"
                value={stats?.unitsDonated}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Enter number of units donated"
                required
              />
              <p className="text-gray-500 text-xs mt-1">
                Total number of blood units donated
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Updating..." : "Update Statistics"}
              </button>
              <button
                type="button"
                onClick={fetchStatistics}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">📌 Note:</span> These values will be
              displayed on the home page stats section. Update them manually whenever
              you need to reflect the latest numbers.
            </p>
          </div>
        </div>

        {/* Current Stats Display */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">🩸</div>
            <p className="text-gray-600 text-sm font-medium">Active Donors</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats?.activeDonors}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-gray-600 text-sm font-medium">Patients Helped</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.patientsHelped}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-gray-600 text-sm font-medium">Units Donated</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.unitsDonated}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
