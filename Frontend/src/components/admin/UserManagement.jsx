import React, { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import useAxios from "../../Hooks/useAxios.js";
import { useUserRole } from "../../Hooks/useAuthQuery.js";
import { AuthProvider } from "../../context/ContextProvider.jsx";
import { getAuth } from "firebase/auth";

const UserManagement = () => {
  const { user: userData, isLoading: userLoading } = useUserRole();
  const Axios = useAxios();
  const { user } = useContext(AuthProvider);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    bloodGroup: "",
    district: "",
    lastDonateDate: "",
    bloodGiven: 0,
    bloodTaken: 0,
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const districts = [
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Barisal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
    "Comilla",
    "Gazipur",
    "Narayanganj",
    "Narsingdi",
    "Tangail",
    "Jamalpur",
    "Sherpur",
    "Netrokona",
    "Kishoreganj",
    "Manikganj",
    "Munshiganj",
    "Gopalganj",
    "Faridpur",
    "Madaripur",
    "Shariatpur",
    "Rajbari",
    "Cox's Bazar",
    "Feni",
    "Lakshmipur",
    "Noakhali",
    "Brahmanbaria",
    "Chandpur",
    "Khagrachari",
    "Rangamati",
    "Bandarban",
    "Bogra",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Chapainawabganj",
    "Pabna",
    "Sirajganj",
    "Bagerhat",
    "Chuadanga",
    "Jessore",
    "Jhenaidah",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
    "Barguna",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
    "Habiganj",
    "Moulvibazar",
    "Sunamganj",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await Axios.get("/users");
      const userArray = Array.isArray(response.data) ? response.data : [];
      const normalized = userArray.map((u) => ({
        ...u,
        name: u.Name || u.name || "",
        _id: u._id,
      }));
      setUsers(normalized);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to fetch users",
        text: error.response?.data?.message || "Server error",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.district || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Swal.fire({ icon: "error", title: "Name is required" });
      return false;
    }
    if (!formData.email.trim()) {
      Swal.fire({ icon: "error", title: "Email is required" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Swal.fire({ icon: "error", title: "Invalid email format" });
      return false;
    }
    if (!formData.role) {
      Swal.fire({ icon: "error", title: "Role is required" });
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password must be at least 6 characters",
      });
      return false;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: "error", title: "Passwords do not match" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSend = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        bloodGroup: formData.bloodGroup || "",
        district: formData.district || "",
        lastDonateDate: formData.lastDonateDate ? new Date(formData.lastDonateDate).toISOString() : null,
        bloodGiven: parseInt(formData.bloodGiven) || 0,
        bloodTaken: parseInt(formData.bloodTaken) || 0,
      };

      if (formData.password && formData.password.trim()) {
        dataToSend.password = formData.password;
      }

      await Axios.put(`/users/${editId}`, dataToSend);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "User updated successfully",
        showConfirmButton: false,
        timer: 1500,
      });

      handleCloseModal();
      fetchUsers();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to update user",
        text: error.response?.data?.message || "Server error",
      });
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || user.Name || "",
      phone: user.phone || "",
      email: user.email || "",
      role: user.role || "",
      bloodGroup: user.bloodGroup || "",
      district: user.district || "",
      lastDonateDate: user.lastDonateDate ? new Date(user.lastDonateDate).toISOString().split('T')[0] : "",
      bloodGiven: user.bloodGiven || 0,
      bloodTaken: user.bloodTaken || 0,
      password: "",
      confirmPassword: "",
    });
    setEditId(user._id);
    setShowModal(true);
  };

  const handleDelete = async (userId, userEmail) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will delete the user from both database and Firebase!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        // Delete from database first
        await Axios.delete(`/users/${userId}`);

        // Note: Firebase Admin SDK is needed on backend to delete users by email
        // Client-side Firebase can only delete currently authenticated user
        // Send request to backend to handle Firebase deletion
        try {
          await Axios.post("/delete-firebase-user", { email: userEmail });
        } catch (firebaseError) {
          console.error("Firebase deletion error:", firebaseError);
          // Continue even if Firebase deletion fails
        }

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "User deleted successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchUsers();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to delete user",
        text: error.response?.data?.message || "Server error",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      role: "",
      bloodGroup: "",
      district: "",
      lastDonateDate: "",
      bloodGiven: 0,
      bloodTaken: 0,
      password: "",
      confirmPassword: "",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-8xl mx-auto">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    name="phone"
                    placeholder="+88 1XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    autoComplete="off"
                    value={formData.email}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="executive">Moderator</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Blood Group</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select District</option>
                    {districts.map((district, idx) => (
                      <option key={idx} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Donation Date
                  </label>
                  <input
                    name="lastDonateDate"
                    type="date"
                    value={formData.lastDonateDate}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Given (Donated)
                  </label>
                  <input
                    name="bloodGiven"
                    type="number"
                    min="0"
                    value={formData.bloodGiven}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Taken (Received)
                  </label>
                  <input
                    name="bloodTaken"
                    type="number"
                    min="0"
                    value={formData.bloodTaken}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (Leave blank to keep current)
                  </label>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    autoComplete="off"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 cursor-pointer text-sm"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    autoComplete="off"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded text-white bg-green-600 hover:bg-green-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Manage all users and their details</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or district..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Phone</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Blood Group</th>
              <th className="px-6 py-3 text-left font-semibold">District</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">{user.name || user.Name}</td>
                <td className="px-6 py-4">{user.phone || "-"}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">{user.bloodGroup || "-"}</td>
                <td className="px-6 py-4">{user.district || "-"}</td>
                <td className="px-6 py-4 space-x-2 flex">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user._id, user.email)}
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
