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
  Edit,
  Trash2,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";
import { baseURL } from "../../Hooks/useAxios.js";


const BloodStock = () => {
  const [stockData, setStockData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showBloodUsageModal, setShowBloodUsageModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [userDirectory, setUserDirectory] = useState([]);
  const [phoneSuggestions, setPhoneSuggestions] = useState([]);
  const [matchedUser, setMatchedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [availableBloodBags, setAvailableBloodBags] = useState([]);
  const [loadingBags, setLoadingBags] = useState(false);
  const [bloodUsageForm, setBloodUsageForm] = useState({
    status: "available",
    usedDate: "",
    usedBy: "",
    patientName: "",
    hospital: "",
    notes: ""
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [donationPage, setDonationPage] = useState(1);
  const donationItemsPerPage = 20;

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
    bloodBagNumber: "",
    selectedBloodBag: "",
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
    fetchDonationHistory();
  }, []);

  useEffect(() => {
    if (
      (activeTab === "entry" || activeTab === "overview") &&
      userDirectory.length === 0
    ) {
      fetchUserDirectory();
    }
  }, [activeTab, userDirectory.length]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters, currentPage]);

  useEffect(() => {
    setDonationPage(1);
  }, [donationHistory.length]);

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

  const fetchDonationHistory = async () => {
    try {
      const response = await fetch(
        `${baseURL}/admin/donation-history-list`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDonationHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching donation history:", error);
    }
  };

  const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "object" && value.$oid) return value.$oid;
    return String(value);
  };

  const getUserById = (id) => {
    const normalizedId = normalizeId(id);
    return userDirectory.find((u) => normalizeId(u._id) === normalizedId);
  };

  const fetchUserDirectory = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`${baseURL}/users`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((u) => ({
              ...u,
              name: u.Name || u.name || "",
              phone: u.phone || "",
            }))
          : [];
        setUserDirectory(normalized);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Fetch available blood bags when blood group changes in donate tab
    if (name === "bloodGroup" && activeTab === "donate") {
      fetchAvailableBloodBags(value);
    }
  };

  const handleDonorPhoneChange = (e) => {
    const value = e.target.value;
    const normalizedInput = normalizePhone(value);

    const matches = userDirectory.filter((u) =>
      normalizePhone(u.phone).includes(normalizedInput)
    );

    setPhoneSuggestions(
      normalizedInput.length >= 3 ? matches.slice(0, 8) : []
    );

    const exactMatch = userDirectory.find(
      (u) => normalizePhone(u.phone) === normalizedInput
    );

    setMatchedUser(exactMatch || null);

    setFormData((prev) => {
      const next = { ...prev, donorPhone: value };
      if (exactMatch) {
        next.donorName = exactMatch.Name || exactMatch.name || "";
        if (exactMatch.bloodGroup) {
          next.bloodGroup = exactMatch.bloodGroup;
        }
      } else if (matchedUser) {
        next.donorName = "";
      }
      return next;
    });
  };

  const handleEntryBlood = async (e) => {
    e.preventDefault();

    if (!formData.bloodBagNumber || formData.bloodBagNumber.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Blood Bag Number Required",
        text: "Please enter a blood bag number",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Blood Entry",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Blood Group:</strong> ${formData.bloodGroup}</p>
          <p><strong>Units:</strong> ${formData.units}</p>
          <p><strong>Donor:</strong> ${formData.donorName}</p>
          <p><strong>Phone:</strong> ${formData.donorPhone}</p>
          <p><strong>Blood Bag #:</strong> ${formData.bloodBagNumber}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Entry",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      // First, check if donor phone matches a registered user
      let userId = null;
      let isRegisteredUser = false;
      let matchedUserData = matchedUser;

      if (!matchedUserData) {
        const userCheckResponse = await fetch(
          `${baseURL}/admin/check-user-by-phone`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: formData.donorPhone,
            }),
          }
        );

        if (userCheckResponse.ok) {
          const userData = await userCheckResponse.json();
          matchedUserData = userData.user || null;
        }
      }

      if (matchedUserData) {
        userId = matchedUserData._id;
        isRegisteredUser = true;
      }

      // Add blood to stock
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
          bloodBagNumber: formData.bloodBagNumber.trim(),
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Create donation history
        const historyResponse = await fetch(
          `${baseURL}/admin/donation-history`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              donorName: formData.donorName,
              donorPhone: formData.donorPhone,
              donorAddress: formData.donorAddress,
              bloodGroup: formData.bloodGroup,
              units: parseInt(formData.units),
              bloodBagNumber: formData.bloodBagNumber.trim(),
              userId: isRegisteredUser ? userId : null,
              isRegisteredUser: isRegisteredUser,
              notes: formData.notes,
            }),
          }
        );

        const historyData = await historyResponse.json();

        const userStatus = isRegisteredUser
          ? "Registered User"
          : "Unregistered User";

        Swal.fire({
          icon: "success",
          title: "Blood Entry Successful",
          html: `
            <p>${formData.units} unit(s) of ${formData.bloodGroup} added</p>
            <p class="text-sm text-gray-600 mt-2">Bag #: ${formData.bloodBagNumber}</p>
            <p class="text-sm text-gray-600">New Stock: ${data.newStock} units</p>
            <p class="text-sm text-blue-600 mt-2">📋 Donation History: ${userStatus}</p>
          `,
        });

        // Update matched user's donation stats
        if (isRegisteredUser && userId) {
          const currentGiven = Number(matchedUserData?.bloodGiven || 0);
          await fetch(`${baseURL}/users/${userId}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bloodGiven: currentGiven + parseInt(formData.units),
              lastDonateDate: new Date().toISOString().split("T")[0],
            }),
          });
        }

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
      console.error("Error:", error);
    }
  };

  const fetchAvailableBloodBags = async (bloodGroup) => {
    try {
      setLoadingBags(true);
      console.log(`Fetching bags for blood group: ${bloodGroup}`);
      const response = await fetch(
        `${baseURL}/admin/available-blood-bags?bloodGroup=${encodeURIComponent(bloodGroup)}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched bags for ${bloodGroup}:`, data.bags);
        setAvailableBloodBags(data.bags || []);
        if (data.bags && data.bags.length === 0) {
          console.warn(`No bags found for blood group ${bloodGroup}`);
        }
      } else {
        const errorData = await response.json();
        console.error("Error fetching bags:", errorData);
        setAvailableBloodBags([]);
      }
    } catch (error) {
      console.error("Error fetching blood bags:", error);
      setAvailableBloodBags([]);
    } finally {
      setLoadingBags(false);
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

    if (formData.selectedBloodBag === "") {
      Swal.fire({
        icon: "error",
        title: "Blood Bag Required",
        text: "Please select a blood bag to donate",
      });
      return;
    }

    const selectedBag = availableBloodBags.find(
      (bag) => bag._id === formData.selectedBloodBag
    );

    const result = await Swal.fire({
      title: "Confirm Blood Donation",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Blood Group:</strong> ${formData.bloodGroup}</p>
          <p><strong>Units:</strong> ${formData.units}</p>
          <p><strong>Bag Number:</strong> <span class="badge badge-primary">${selectedBag?.bloodBagNumber || "N/A"}</span></p>
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
          bloodBagId: formData.selectedBloodBag,
          bloodBagNumber: selectedBag?.bloodBagNumber,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Mark the blood bag as used with patient information
        if (formData.selectedBloodBag && selectedBag?.bloodBagNumber) {
          try {
            await fetch(
              `${baseURL}/admin/mark-blood-as-used`,
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bloodBagNumber: selectedBag.bloodBagNumber,
                  patientName: formData.receiverName,
                  patientId: formData.patientId,
                  hospitalName: formData.hospitalName,
                  doctorName: "Admin",
                  dateUsed: new Date().toISOString(),
                  usedBy: "Admin",
                  notes: formData.notes || `Donated to ${formData.hospitalName}`
                })
              }
            );
            console.log("Blood marked as used successfully");
          } catch (error) {
            console.error("Error marking bag as used:", error);
          }
        }

        Swal.fire({
          icon: "success",
          title: "Blood Donated Successfully",
          html: `
            <p>${formData.units} unit(s) of ${formData.bloodGroup} donated</p>
            <p class="text-sm text-gray-600">Bag: ${selectedBag?.bloodBagNumber}</p>
            <p class="text-sm text-gray-600 mt-2">Patient: ${formData.receiverName}</p>
            <p class="text-sm text-gray-600">Hospital: ${formData.hospitalName}</p>
            <p class="text-sm text-gray-600 mt-2">Remaining Stock: ${data.remainingStock} units</p>
          `,
        });

        fetchStockData();
        fetchTransactions();
        fetchDonationHistory();
        resetForm();
        setAvailableBloodBags([]);
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
      bloodBagNumber: "",
      receiverName: "",
      receiverPhone: "",
      hospitalName: "",
      patientId: "",
      neededDate: "",
      notes: "",
      fromBloodGroup: "A+",
      toBloodGroup: "B+",
      selectedBloodBag: "",
    });
    setAvailableBloodBags([]);
    setMatchedUser(null);
    setPhoneSuggestions([]);
  };

  const openBloodUsageModal = (donation) => {
    setSelectedDonation(donation);
    setBloodUsageForm({
      status: donation.status || "available",
      usedDate: "",
      usedBy: "",
      patientName: "",
      hospital: "",
      notes: donation.notes || ""
    });
    setShowBloodUsageModal(true);
  };

  const handleBloodUsageChange = (e) => {
    const { name, value } = e.target;
    setBloodUsageForm({ ...bloodUsageForm, [name]: value });
  };

  const handleUpdateBloodUsage = async () => {
    if (!selectedDonation) return;

    if (
      bloodUsageForm.status === "used" &&
      (!bloodUsageForm.usedDate || !bloodUsageForm.usedBy)
    ) {
      Swal.fire({
        icon: "error",
        title: "Required Fields",
        text: "Please fill in Used Date and Used By when marking as Used"
      });
      return;
    }

    try {
      const response = await fetch(
        `${baseURL}/admin/donation-status/${selectedDonation._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: bloodUsageForm.status,
            usedDate: bloodUsageForm.usedDate || null,
            usedBy: bloodUsageForm.usedBy || "",
            patientName: bloodUsageForm.patientName || "",
            hospital: bloodUsageForm.hospital || "",
            notes: bloodUsageForm.notes || ""
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          html: `
            <p>Blood Bag: ${selectedDonation.bloodBagNumber}</p>
            <p>Blood Group: ${selectedDonation.bloodGroup}</p>
            <p>Status: <strong>${bloodUsageForm.status === "used" ? "Used" : "Available"}</strong></p>
          `
        });
        setShowBloodUsageModal(false);
        fetchDonationHistory();
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message || "Failed to update blood status"
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to connect to server"
      });
      console.error("Error:", error);
    }
  };

  const handleEditTransaction = async (transaction) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Transaction',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-left font-semibold mb-1">Units</label>
            <input id="edit-units" type="number" value="${transaction.units}" min="1" class="swal2-input" />
          </div>
          ${transaction.donorName ? `
          <div>
            <label class="block text-left font-semibold mb-1">Donor Name</label>
            <input id="edit-donorName" type="text" value="${transaction.donorName || ''}" class="swal2-input" />
          </div>
          <div>
            <label class="block text-left font-semibold mb-1">Donor Phone</label>
            <input id="edit-donorPhone" type="text" value="${transaction.donorPhone || ''}" class="swal2-input" />
          </div>
          ` : ''}
          ${transaction.receiverName ? `
          <div>
            <label class="block text-left font-semibold mb-1">Receiver Name</label>
            <input id="edit-receiverName" type="text" value="${transaction.receiverName || ''}" class="swal2-input" />
          </div>
          <div>
            <label class="block text-left font-semibold mb-1">Receiver Phone</label>
            <input id="edit-receiverPhone" type="text" value="${transaction.receiverPhone || ''}" class="swal2-input" />
          </div>
          ` : ''}
          ${transaction.hospitalName ? `
          <div>
            <label class="block text-left font-semibold mb-1">Hospital Name</label>
            <input id="edit-hospitalName" type="text" value="${transaction.hospitalName || ''}" class="swal2-input" />
          </div>
          ` : ''}
          ${transaction.patientId ? `
          <div>
            <label class="block text-left font-semibold mb-1">Patient ID</label>
            <input id="edit-patientId" type="text" value="${transaction.patientId || ''}" class="swal2-input" />
          </div>
          ` : ''}
          <div>
            <label class="block text-left font-semibold mb-1">Notes</label>
            <textarea id="edit-notes" class="swal2-textarea">${transaction.notes || ''}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: () => {
        const newUnits = parseInt(document.getElementById('edit-units').value);
        return {
          units: newUnits,
          donorName: document.getElementById('edit-donorName')?.value || transaction.donorName,
          donorPhone: document.getElementById('edit-donorPhone')?.value || transaction.donorPhone,
          receiverName: document.getElementById('edit-receiverName')?.value || transaction.receiverName,
          receiverPhone: document.getElementById('edit-receiverPhone')?.value || transaction.receiverPhone,
          hospitalName: document.getElementById('edit-hospitalName')?.value || transaction.hospitalName,
          patientId: document.getElementById('edit-patientId')?.value || transaction.patientId,
          notes: document.getElementById('edit-notes')?.value || transaction.notes,
        };
      }
    });

    if (formValues) {
      try {
        const response = await fetch(`${baseURL}/admin/blood-transactions/${transaction._id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Transaction Updated',
            text: 'Stock has been adjusted accordingly',
          });
          fetchStockData();
          fetchTransactions();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: data.message || 'Failed to update transaction',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to connect to server',
        });
      }
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    const result = await Swal.fire({
      title: 'Delete Transaction?',
      html: `
        <div class="text-left space-y-2">
          <p><strong>Type:</strong> ${transaction.type}</p>
          <p><strong>Blood Group:</strong> ${transaction.type === 'exchange' ? `${transaction.fromBloodGroup} → ${transaction.toBloodGroup}` : transaction.bloodGroup}</p>
          <p><strong>Units:</strong> ${transaction.units}</p>
          <p class="text-sm text-gray-600 mt-2">The stock will be restored after deletion.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${baseURL}/admin/blood-transactions/${transaction._id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Transaction Deleted',
            text: 'Stock has been restored',
          });
          fetchStockData();
          fetchTransactions();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: data.message || 'Failed to delete transaction',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to connect to server',
        });
      }
    }
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

  const donationTotalPages = Math.ceil(
    donationHistory.length / donationItemsPerPage
  );
  const paginatedDonationHistory = donationHistory.slice(
    (donationPage - 1) * donationItemsPerPage,
    donationPage * donationItemsPerPage
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
        {/* <button
          className={`tab whitespace-nowrap ${
            activeTab === "exchange" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("exchange")}
        >
          <ArrowRightLeft size={16} className="mr-2" />
          Exchange Blood
        </button> */}
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

          {/* Donation History with Bag Numbers */}
          <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 md:p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Activity className="text-blue-600" size={28} />
                Recent Blood Donations with Bag Numbers
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Latest donations showing blood bag numbers and donor status
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-xs md:text-sm">Donor Info</th>
                    <th className="text-xs md:text-sm">Blood Type & Units</th>
                    <th className="text-xs md:text-sm">Bag Number</th>
                    <th className="text-xs md:text-sm">Status & Expiry</th>
                    <th className="text-xs md:text-sm">Usage Info</th>
                    <th className="text-xs md:text-sm">Date</th>
                    <th className="text-xs md:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donationHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-gray-500">
                        No donation history found
                      </td>
                    </tr>
                  ) : (
                    paginatedDonationHistory.map((donation, index) => {
                      // Calculate bag expiry date (15 days from donation date)
                      const donationDate = donation.donationDate ? new Date(donation.donationDate) : null;
                      const expiryDate = donationDate ? new Date(donationDate.getTime() + 15 * 24 * 60 * 60 * 1000) : null;
                      const today = new Date();
                      const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : null;
                      const patientFromDirectory = donation.usedFor?.patientId
                        ? getUserById(donation.usedFor.patientId)
                        : null;
                      const patientDisplayName =
                        donation.usedFor?.patientName || patientFromDirectory?.name || "";
                      const patientDisplayPhone =
                        patientFromDirectory?.phone || "";
                      const donorFromDirectory = donation.userId
                        ? getUserById(donation.userId)
                        : null;
                      const donorDisplayName =
                        donation.donorName || donorFromDirectory?.name || "N/A";
                      const donorDisplayPhone =
                        donation.donorPhone || donorFromDirectory?.phone || "";
                      
                      // Determine expiry status
                      let expiryStatus = "valid";
                      let expiryBadgeClass = "badge-success";
                      if (daysUntilExpiry !== null) {
                        if (daysUntilExpiry < 0) {
                          expiryStatus = "expired";
                          expiryBadgeClass = "badge-error";
                        } else if (daysUntilExpiry <= 3) {
                          expiryStatus = "expiring";
                          expiryBadgeClass = "badge-warning";
                        }
                      }

                      return (
                        <tr key={donation._id || index} className={expiryStatus === "expired" ? "bg-red-50" : expiryStatus === "expiring" ? "bg-yellow-50" : "hover"}>
                          {/* Donor Info */}
                          <td>
                            <div className="flex flex-col space-y-1">
                              <span className="font-semibold text-gray-800 text-sm">
                                {donorDisplayName}
                              </span>
                              {donorDisplayPhone && (
                                <span className="text-xs text-gray-600">
                                  {donorDisplayPhone}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          {/* Blood Type & Units */}
                          <td>
                            <div className="flex flex-col items-start gap-1">
                              <span className="badge badge-error text-sm font-bold">
                                {donation.bloodGroup}
                              </span>
                              <span className="text-xs font-semibold text-gray-700">
                                {donation.units} {donation.units > 1 ? 'units' : 'unit'}
                              </span>
                            </div>
                          </td>

                          {/* Bag Number */}
                          <td>
                            <div className="flex flex-col gap-1">
                              <span className="badge badge-primary text-xs font-semibold">
                                {donation.bloodBagNumber || "N/A"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(donation.donationDate)}
                              </span>
                            </div>
                          </td>

                          {/* Status & Expiry */}
                          <td>
                            <div className="flex flex-col gap-1">
                              <span
                                className={`badge text-xs font-semibold ${
                                  donation.bloodUsed
                                    ? "badge-error"
                                    : "badge-info"
                                }`}
                              >
                                {donation.bloodUsed ? "✓ Used" : "○ Available"}
                              </span>
                              {!donation.bloodUsed && (
                                <>
                                  <span className={`badge text-xs ${expiryBadgeClass}`}>
                                    {expiryStatus === "expired" ? "✗ Expired" : expiryStatus === "expiring" ? "⚠ Expiring" : "✓ Valid"}
                                  </span>
                                  {daysUntilExpiry !== null && (
                                    <span className={`text-xs font-semibold ${daysUntilExpiry < 0 ? "text-red-600" : daysUntilExpiry <= 3 ? "text-orange-600" : "text-green-600"}`}>
                                      {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)}d ago` : `${daysUntilExpiry}d left`}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>

                          {/* Usage Info - Patient/Hospital/Reason */}
                          <td>
                            {donation.bloodUsed && (patientDisplayName || donation.usedFor?.patientName) ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <User size={12} className="text-gray-500" />
                                  <span className="font-semibold text-xs text-gray-800">
                                    {patientDisplayName}
                                  </span>
                                </div>
                                {patientDisplayPhone && (
                                  <p className="text-xs text-gray-600">{patientDisplayPhone}</p>
                                )}
                                {donation.usedFor?.patientId && (
                                  <p className="text-xs text-gray-600">ID: {donation.usedFor.patientId}</p>
                                )}
                                {(donation.usedFor?.hospitalName || donation.hospitalName) && (
                                  <div className="flex items-center gap-1">
                                    <Hospital size={12} className="text-gray-500" />
                                    <span className="text-xs text-gray-600">
                                      {donation.usedFor?.hospitalName || donation.hospitalName}
                                    </span>
                                  </div>
                                )}
                                {donation.usedFor?.dateUsed && (
                                  <p className="text-xs text-gray-500">
                                    {new Date(donation.usedFor.dateUsed).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Not used yet</span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="text-xs text-gray-600">
                            {donation.donationDate
                              ? new Date(donation.donationDate).toLocaleDateString()
                              : "N/A"}
                          </td>

                          {/* Actions */}
                          <td>
                            <button
                              onClick={() => openBloodUsageModal(donation)}
                              className="btn btn-xs btn-outline btn-primary"
                              title="Update Blood Usage Status"
                            >
                              <Edit size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-gray-600">
              <div>
                Showing {paginatedDonationHistory.length} of {donationHistory.length} donations
              </div>

              {donationTotalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDonationPage((prev) => Math.max(1, prev - 1))}
                    disabled={donationPage === 1}
                    className="btn btn-sm btn-outline"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex gap-1">
                    {[...Array(donationTotalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setDonationPage(i + 1)}
                        className={`btn btn-sm ${
                          donationPage === i + 1 ? "btn-active" : "btn-outline"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setDonationPage((prev) =>
                        Math.min(donationTotalPages, prev + 1)
                      )
                    }
                    disabled={donationPage === donationTotalPages}
                    className="btn btn-sm btn-outline"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
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
                    Donor Phone *
                  </span>
                </label>
                <input
                  type="tel"
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleDonorPhoneChange}
                  list="donor-phone-suggestions"
                  className="input input-bordered w-full"
                  required
                />
                <datalist id="donor-phone-suggestions">
                  {phoneSuggestions.map((u) => (
                    <option key={u._id} value={u.phone}>
                      {u.phone} - {u.Name || u.name || ""}
                    </option>
                  ))}
                </datalist>
                <div className="mt-1 text-xs">
                  {loadingUsers && (
                    <span className="text-gray-500">Loading users...</span>
                  )}
                  {!loadingUsers && matchedUser && (
                    <span className="text-green-600 font-semibold">
                      Matched: {matchedUser.Name || matchedUser.name || ""}
                      {matchedUser.bloodGroup
                        ? ` • ${matchedUser.bloodGroup}`
                        : ""}
                    </span>
                  )}
                  {!loadingUsers &&
                    !matchedUser &&
                    normalizePhone(formData.donorPhone).length >= 10 && (
                      <span className="text-orange-600">
                        No user found. Entry will be saved as new donor.
                      </span>
                    )}
                </div>
              </div>

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
                    Blood Bag Number *
                  </span>
                </label>
                <input
                  type="text"
                  name="bloodBagNumber"
                  value={formData.bloodBagNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., BAG-2024-001"
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

              {/* Blood Bag Selector */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Select Blood Bag *
                  </span>
                </label>
                {loadingBags ? (
                  <div className="select select-bordered w-full flex items-center justify-center">
                    <span className="loading loading-spinner loading-sm"></span>
                    Loading bags...
                  </div>
                ) : availableBloodBags.length > 0 ? (
                  <select
                    name="selectedBloodBag"
                    value={formData.selectedBloodBag}
                    onChange={handleInputChange}
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
                ) : formData.bloodGroup ? (
                  <div className="alert alert-warning">
                    <span>No available blood bags for {formData.bloodGroup}</span>
                  </div>
                ) : (
                  <div className="select select-bordered w-full text-gray-500">
                    Select blood group first
                  </div>
                )}
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
                  <th className="text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
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
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="btn btn-xs btn-outline btn-info"
                            title="Edit Transaction"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="btn btn-xs btn-outline btn-error"
                            title="Delete Transaction"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Blood Usage Update Modal */}
      {showBloodUsageModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-blue-600" size={24} />
              Update Blood Usage Status
            </h2>

            <div className="space-y-4 mb-6">
              {/* Display Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Blood Group:</strong>{" "}
                  <span className="badge badge-outline">
                    {selectedDonation.bloodGroup}
                  </span>
                </p>
                <p className="text-sm mt-2">
                  <strong>Bag Number:</strong>{" "}
                  <span className="badge badge-primary">
                    {selectedDonation.bloodBagNumber}
                  </span>
                </p>
                <p className="text-sm mt-2">
                  <strong>Donor:</strong> {selectedDonation.donorName} (
                  {selectedDonation.donorPhone})
                </p>
              </div>

              {/* Status Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Blood Status *
                  </span>
                </label>
                <select
                  name="status"
                  value={bloodUsageForm.status}
                  onChange={handleBloodUsageChange}
                  className="select select-bordered"
                >
                  <option value="available">Available (Not Used)</option>
                  <option value="used">Used</option>
                </select>
              </div>

              {/* Conditional fields if used */}
              {bloodUsageForm.status === "used" && (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Date Used *
                      </span>
                    </label>
                    <input
                      type="date"
                      name="usedDate"
                      value={bloodUsageForm.usedDate}
                      onChange={handleBloodUsageChange}
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Used By (Doctor/Staff) *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="usedBy"
                      value={bloodUsageForm.usedBy}
                      onChange={handleBloodUsageChange}
                      placeholder="Doctor or Staff Name"
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Patient Name</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={bloodUsageForm.patientName}
                      onChange={handleBloodUsageChange}
                      placeholder="Patient Name (Optional)"
                      className="input input-bordered"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Hospital/Facility</span>
                    </label>
                    <input
                      type="text"
                      name="hospital"
                      value={bloodUsageForm.hospital}
                      onChange={handleBloodUsageChange}
                      placeholder="Hospital Name (Optional)"
                      className="input input-bordered"
                    />
                  </div>
                </>
              )}

              {/* Notes */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Additional Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={bloodUsageForm.notes}
                  onChange={handleBloodUsageChange}
                  placeholder="Any additional notes..."
                  className="textarea textarea-bordered"
                  rows="3"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBloodUsageModal(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBloodUsage}
                className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                <Check size={18} />
                Update Status
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BloodStock;

