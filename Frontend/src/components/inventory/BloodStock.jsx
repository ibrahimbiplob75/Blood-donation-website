import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Plus,
  Minus,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Hospital,
  Activity,
  RefreshCw,
  Filter,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import { baseURL } from "../../Hooks/useAxios.js";

const BloodStock = () => {
  const [stockData, setStockData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filters
  const [filters, setFilters] = useState({
    type: "all",
    bloodGroup: "all",
    searchTerm: "",
    dateFrom: "",
    dateTo: "",
  });

  const [formData, setFormData] = useState({
    bloodGroup: "A+",
    units: 1,
    donorName: "",
    donorPhone: "",
    donorAddress: "",
    receiverName: "",
    receiverPhone: "",
    hospitalName: "",
    patientId: "",
    neededDate: "",
    notes: "",
    fromBloodGroup: "A+",
    toBloodGroup: "B+",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    fetchStockData();
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters, currentPage]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/admin/blood-stock`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setStockData(data.stock || {});
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${baseURL}/admin/blood-transactions?limit=500`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Sort by most recent first
    filtered.sort((a, b) => {
      const dateA = new Date(a.donatedAt || a.createdAt || 0);
      const dateB = new Date(b.donatedAt || b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Blood group filter
    if (filters.bloodGroup !== "all") {
      filtered = filtered.filter(
        (t) =>
          t.bloodGroup === filters.bloodGroup ||
          t.fromBloodGroup === filters.bloodGroup ||
          t.toBloodGroup === filters.bloodGroup
      );
    }

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.donorName?.toLowerCase().includes(term) ||
          t.receiverName?.toLowerCase().includes(term) ||
          t.hospitalName?.toLowerCase().includes(term) ||
          t.patientId?.toLowerCase().includes(term)
      );
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (t) =>
          new Date(t.createdAt || t.donatedAt) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (t) => new Date(t.createdAt || t.donatedAt) <= new Date(filters.dateTo)
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: "all",
      bloodGroup: "all",
      searchTerm: "",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEntryBlood = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Confirm Blood Entry",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Blood Group:</strong> ${formData.bloodGroup}</p>
          <p><strong>Units:</strong> ${formData.units}</p>
          <p><strong>Donor:</strong> ${formData.donorName}</p>
          <p><strong>Phone:</strong> ${formData.donorPhone}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Entry",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${baseURL}/admin/blood-entry`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodGroup: formData.bloodGroup,
          units: parseInt(formData.units),
          donorName: formData.donorName,
          donorPhone: formData.donorPhone,
          donorAddress: formData.donorAddress,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Blood Entry Successful",
          html: `
            <p>${formData.units} unit(s) of ${formData.bloodGroup} added</p>
            <p class="text-sm text-gray-600 mt-2">New Stock: ${data.newStock} units</p>
          `,
        });

        fetchStockData();
        fetchTransactions();
        resetForm();
      } else {
        Swal.fire({
          icon: "error",
          title: "Entry Failed",
          text: data.message || "Failed to add blood to stock",
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

  const handleDonateBlood = async (e) => {
    e.preventDefault();

    const currentStock = stockData[formData.bloodGroup] || 0;
    if (currentStock < formData.units) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Stock",
        text: `Only ${currentStock} unit(s) available for ${formData.bloodGroup}`,
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Blood Donation",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Blood Group:</strong> ${formData.bloodGroup}</p>
          <p><strong>Units:</strong> ${formData.units}</p>
          <p><strong>Receiver:</strong> ${formData.receiverName}</p>
          <p><strong>Hospital:</strong> ${formData.hospitalName}</p>
          ${
            formData.patientId
              ? `<p><strong>Patient ID:</strong> ${formData.patientId}</p>`
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Donation",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${baseURL}/admin/blood-donate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodGroup: formData.bloodGroup,
          units: parseInt(formData.units),
          receiverName: formData.receiverName,
          receiverPhone: formData.receiverPhone,
          patientId: formData.patientId,
          neededDate: formData.neededDate,
          hospitalName: formData.hospitalName,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Blood Donated Successfully",
          html: `
            <p>${formData.units} unit(s) of ${formData.bloodGroup} donated</p>
            <p class="text-sm text-gray-600 mt-2">Remaining Stock: ${data.remainingStock} units</p>
          `,
        });

        fetchStockData();
        fetchTransactions();
        resetForm();
      } else {
        Swal.fire({
          icon: "error",
          title: "Donation Failed",
          text: data.message || "Failed to donate blood",
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

  const handleExchangeBlood = async (e) => {
    e.preventDefault();

    const fromStock = stockData[formData.fromBloodGroup] || 0;
    if (fromStock < formData.units) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Stock",
        text: `Only ${fromStock} unit(s) available for ${formData.fromBloodGroup}`,
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Blood Exchange",
      html: `
        <div class="text-left space-y-2">
          <p><strong>From:</strong> ${formData.fromBloodGroup} (${
        formData.units
      } units)</p>
          <p><strong>To:</strong> ${formData.toBloodGroup} (${
        formData.units
      } units)</p>
          <p><strong>Hospital:</strong> ${formData.hospitalName}</p>
          ${
            formData.patientId
              ? `<p><strong>Patient ID:</strong> ${formData.patientId}</p>`
              : ""
          }
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Exchange",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${baseURL}/admin/blood-exchange`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromBloodGroup: formData.fromBloodGroup,
          toBloodGroup: formData.toBloodGroup,
          units: parseInt(formData.units),
          hospitalName: formData.hospitalName,
          patientId: formData.patientId,
          neededDate: formData.neededDate,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Blood Exchange Successful",
          html: `
            <p>${formData.units} unit(s) exchanged: ${formData.fromBloodGroup} → ${formData.toBloodGroup}</p>
            <p class="text-sm text-gray-600 mt-2">
              ${formData.fromBloodGroup}: ${data.fromStock} units | 
              ${formData.toBloodGroup}: ${data.toStock} units
            </p>
          `,
        });

        fetchStockData();
        fetchTransactions();
        resetForm();
      } else {
        Swal.fire({
          icon: "error",
          title: "Exchange Failed",
          text: data.message || "Failed to exchange blood",
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

  const resetForm = () => {
    setFormData({
      bloodGroup: "A+",
      units: 1,
      donorName: "",
      donorPhone: "",
      donorAddress: "",
      receiverName: "",
      receiverPhone: "",
      hospitalName: "",
      patientId: "",
      neededDate: "",
      notes: "",
      fromBloodGroup: "A+",
      toBloodGroup: "B+",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Blood Group",
      "Units",
      "Name",
      "Phone",
      "Hospital",
      "Notes",
    ];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.createdAt || t.donatedAt),
      t.type,
      t.type === "exchange"
        ? `${t.fromBloodGroup} → ${t.toBloodGroup}`
        : t.bloodGroup,
      t.units,
      t.donorName || t.receiverName || "",
      t.donorPhone || t.receiverPhone || "",
      t.hospitalName || "",
      t.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blood-transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "from-red-500 to-red-600",
      "A-": "from-red-600 to-red-700",
      "B+": "from-blue-500 to-blue-600",
      "B-": "from-blue-600 to-blue-700",
      "O+": "from-green-500 to-green-600",
      "O-": "from-green-600 to-green-700",
      "AB+": "from-purple-500 to-purple-600",
      "AB-": "from-purple-600 to-purple-700",
    };
    return colors[bloodGroup] || "from-gray-500 to-gray-600";
  };

  const getStockStatus = (count) => {
    if (count === 0)
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-100" };
    if (count < 5)
      return {
        text: "Low Stock",
        color: "text-orange-600",
        bg: "bg-orange-100",
      };
    if (count < 10)
      return {
        text: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { text: "Good Stock", color: "text-green-600", bg: "bg-green-100" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "entry":
        return <Plus className="text-green-600" size={20} />;
      case "donate":
        return <Minus className="text-red-600" size={20} />;
      case "exchange":
        return <ArrowRightLeft className="text-blue-600" size={20} />;
      default:
        return <Activity className="text-gray-600" size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "entry":
        return "badge-success";
      case "donate":
        return "badge-error";
      case "exchange":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Droplets className="text-red-600" size={40} />
              Blood Stock Management
            </h1>
            <p className="text-gray-600">
              Manage blood inventory, entries, donations, and exchanges
            </p>
          </div>
          <button
            onClick={() => {
              fetchStockData();
              fetchTransactions();
            }}
            className="btn btn-circle btn-outline"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-8 bg-white shadow-lg p-2 overflow-x-auto flex-nowrap">
        <button
          className={`tab whitespace-nowrap ${
            activeTab === "overview" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <TrendingUp size={16} className="mr-2" />
          Overview
        </button>
        <button
          className={`tab whitespace-nowrap ${
            activeTab === "entry" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("entry")}
        >
          <Plus size={16} className="mr-2" />
          Blood Entry
        </button>
        <button
          className={`tab whitespace-nowrap ${
            activeTab === "donate" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("donate")}
        >
          <Minus size={16} className="mr-2" />
          Donate Blood
        </button>
        <button
          className={`tab whitespace-nowrap ${
            activeTab === "exchange" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("exchange")}
        >
          <ArrowRightLeft size={16} className="mr-2" />
          Exchange Blood
        </button>
        <button
          className={`tab whitespace-nowrap ${
            activeTab === "history" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          <Calendar size={16} className="mr-2" />
          History
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Blood Group Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {bloodGroups.map((group) => {
              const count = stockData[group] || 0;
              const status = getStockStatus(count);

              return (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gradient-to-br ${getBloodGroupColor(
                    group
                  )} rounded-xl p-4 md:p-6 text-white shadow-lg`}
                >
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <h3 className="text-xl md:text-2xl font-bold">{group}</h3>
                    <Droplets size={20} className="md:w-6 md:h-6" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold mb-2">{count}</p>
                  <p className="text-xs md:text-sm opacity-90">
                    units available
                  </p>
                  <div
                    className={`mt-2 md:mt-3 px-2 py-1 rounded text-xs font-semibold ${status.bg} ${status.color}`}
                  >
                    {status.text}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">Total Stock</p>
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">
                    {Object.values(stockData).reduce((a, b) => a + b, 0)}
                  </p>
                  <p className="text-sm text-gray-500">units</p>
                </div>
                <TrendingUp className="text-blue-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">Low Stock Groups</p>
                  <p className="text-3xl md:text-4xl font-bold text-orange-600">
                    {
                      Object.entries(stockData).filter(
                        ([, count]) => count < 5 && count > 0
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-500">blood groups</p>
                </div>
                <TrendingDown className="text-orange-600" size={40} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-2">Out of Stock</p>
                  <p className="text-3xl md:text-4xl font-bold text-red-600">
                    {
                      Object.entries(stockData).filter(
                        ([, count]) => count === 0
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-500">blood groups</p>
                </div>
                <Droplets className="text-red-600" size={40} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blood Entry Tab */}
      {activeTab === "entry" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <Plus className="text-green-600" />
            Add Blood to Stock
          </h2>

          <form onSubmit={handleEntryBlood} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Blood Group *
                  </span>
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Units *</span>
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  min="1"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Donor Name *</span>
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Donor Phone *
                  </span>
                </label>
                <input
                  type="tel"
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">
                    Donor Address
                  </span>
                </label>
                <textarea
                  name="donorAddress"
                  value={formData.donorAddress}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  rows="2"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline w-full sm:w-auto"
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                <Plus size={20} />
                Add Blood Entry
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Donate Blood Tab */}
      {activeTab === "donate" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <Minus className="text-red-600" />
            Donate Blood from Stock
          </h2>

          <form onSubmit={handleDonateBlood} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Blood Group *
                  </span>
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group} - {stockData[group] || 0} units available
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Units *</span>
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  min="1"
                  max={stockData[formData.bloodGroup] || 0}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Receiver Name *
                  </span>
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Receiver Phone
                  </span>
                </label>
                <input
                  type="tel"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Patient ID</span>
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Needed Date *
                  </span>
                </label>
                <input
                  type="date"
                  name="neededDate"
                  value={formData.neededDate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">
                    Hospital Name *
                  </span>
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline w-full sm:w-auto"
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              >
                <Minus size={20} />
                Donate Blood
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Exchange Blood Tab */}
      {activeTab === "exchange" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <ArrowRightLeft className="text-blue-600" />
            Exchange Blood Between Groups
          </h2>

          <form onSubmit={handleExchangeBlood} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    From Blood Group *
                  </span>
                </label>
                <select
                  name="fromBloodGroup"
                  value={formData.fromBloodGroup}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group} - {stockData[group] || 0} units available
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    To Blood Group *
                  </span>
                </label>
                <select
                  name="toBloodGroup"
                  value={formData.toBloodGroup}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                  required
                >
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Units *</span>
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleInputChange}
                  min="1"
                  max={stockData[formData.fromBloodGroup] || 0}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Patient ID</span>
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Blood Needed Date
                  </span>
                </label>
                <input
                  type="date"
                  name="neededDate"
                  value={formData.neededDate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">
                    Hospital Name *
                  </span>
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline w-full sm:w-auto"
              >
                Reset
              </button>
              <button
                type="submit"
                className="btn bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <ArrowRightLeft size={20} />
                Exchange Blood
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Transaction History Tab */}
      {activeTab === "history" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 md:p-6 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Calendar className="text-gray-600" />
                Transaction History
              </h2>
              <button
                onClick={exportToCSV}
                className="btn btn-sm bg-green-600 hover:bg-green-700 text-white"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            {/* Filters */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="form-control">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="all">All Types</option>
                  <option value="entry">Entry</option>
                  <option value="donate">Donate</option>
                  <option value="exchange">Exchange</option>
                </select>
              </div>

              <div className="form-control">
                <select
                  value={filters.bloodGroup}
                  onChange={(e) =>
                    handleFilterChange("bloodGroup", e.target.value)
                  }
                  className="select select-bordered select-sm w-full"
                >
                  <option value="all">All Blood Groups</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="input input-bordered input-sm w-full"
                  placeholder="From Date"
                />
              </div>

              <div className="form-control">
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="input input-bordered input-sm w-full"
                  placeholder="To Date"
                />
              </div>

              <div className="form-control">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) =>
                      handleFilterChange("searchTerm", e.target.value)
                    }
                    placeholder="Search..."
                    className="input input-bordered input-sm w-full"
                  />
                  <button
                    onClick={clearFilters}
                    className="btn btn-sm btn-outline"
                    title="Clear Filters"
                  >
                    <Filter size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Showing {paginatedTransactions.length} of{" "}
              {filteredTransactions.length} transactions
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-xs md:text-sm">Type</th>
                  <th className="text-xs md:text-sm">Blood Group</th>
                  <th className="text-xs md:text-sm">Units</th>
                  <th className="text-xs md:text-sm">Details</th>
                  <th className="text-xs md:text-sm">Date</th>
                  <th className="text-xs md:text-sm">Stock Change</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction, index) => (
                    <tr key={transaction._id} className="hover">
                      <td>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span
                            className={`badge badge-sm ${getTypeColor(
                              transaction.type
                            )}`}
                          >
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-outline">
                          {transaction.type === "exchange"
                            ? `${transaction.fromBloodGroup} → ${transaction.toBloodGroup}`
                            : transaction.bloodGroup}
                        </span>
                      </td>
                      <td>
                        <span className="font-bold">{transaction.units}</span>
                      </td>
                      <td>
                        <div className="text-xs space-y-1">
                          {transaction.donorName && (
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>{transaction.donorName}</span>
                            </div>
                          )}
                          {transaction.receiverName && (
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              <span>{transaction.receiverName}</span>
                            </div>
                          )}
                          {transaction.hospitalName && (
                            <div className="flex items-center gap-1">
                              <Hospital size={12} />
                              <span>{transaction.hospitalName}</span>
                            </div>
                          )}
                          {transaction.patientId && (
                            <div className="text-gray-500">
                              ID: {transaction.patientId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-xs">
                        {formatDate(
                          transaction.createdAt || transaction.donatedAt
                        )}
                      </td>
                      <td>
                        <div className="text-xs">
                          {transaction.type === "entry" && (
                            <span className="text-green-600 font-semibold">
                              +{transaction.units} → {transaction.newStock}
                            </span>
                          )}
                          {transaction.type === "donate" && (
                            <span className="text-red-600 font-semibold">
                              -{transaction.units} → {transaction.newStock}
                            </span>
                          )}
                          {transaction.type === "exchange" && (
                            <div className="space-y-1">
                              <div className="text-red-600">
                                {transaction.fromBloodGroup}: -
                                {transaction.units}
                              </div>
                              <div className="text-green-600">
                                {transaction.toBloodGroup}: +{transaction.units}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-sm btn-outline"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn btn-sm ${
                      currentPage === i + 1 ? "btn-active" : "btn-outline"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-outline"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BloodStock;
