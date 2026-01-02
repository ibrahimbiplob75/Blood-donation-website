import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import useAxios from "../../Hooks/useAxios.js";
import branches from "../../public/branch.json";
import { useUserRole } from "../../Hooks/useAuthQuery.js";

const UserManagement = () => {
  const { user: userData, isLoading: userLoading } = useUserRole();
  const Axios = useAxios();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "+88 ",
    email: "",
    role: "",
    subrole: "",
    branch: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await Axios.get("/admin/verify-token");
      if (response.data.authenticated) {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await Axios.get("/admin/users");
      const userArray = Array.isArray(response.data)
        ? response.data
        : response.data.users || [];
      setUsers(userArray);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to fetch users",
        text: error.response?.data?.message || "Please try again later.",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = currentUser?.role === "Admin";


  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Swal.fire({ icon: "error", title: "First name is required" });
      return false;
    }
    if (!formData.lastName.trim()) {
      Swal.fire({ icon: "error", title: "Last name is required" });
      return false;
    }
    if (!isProfileEdit && !formData.email.trim()) {
      Swal.fire({ icon: "error", title: "Email is required" });
      return false;
    }
    if (!isProfileEdit && !formData.role) {
      Swal.fire({ icon: "error", title: "Role is required" });
      return false;
    }
    if (!isProfileEdit && !formData.branch) {
      Swal.fire({ icon: "error", title: "Branch is required" });
      return false;
    }
    if (!editMode && !formData.password) {
      Swal.fire({ icon: "error", title: "Password is required" });
      return false;
    }
    if (!editMode && formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: "error", title: "Passwords do not match" });
      return false;
    }
    if (
      editMode &&
      formData.password &&
      formData.password !== formData.confirmPassword
    ) {
      Swal.fire({ icon: "error", title: "Passwords do not match" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dataToSend = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone,
        email: formData.email.trim(),
        role: formData.role,
        subrole: formData.subrole,
        branch: formData.branch,
      };

      if (!isProfileEdit) {
        dataToSend.email = formData.email.trim();
        dataToSend.role = formData.role;
        dataToSend.subrole = formData.subrole;
        dataToSend.branch = formData.branch;
      }

      if (!editMode || formData.password) {
        dataToSend.password = formData.password;
      }

      if (editMode) {
        await Axios.put(`/admin/users/${editId}`, dataToSend);

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: isProfileEdit
            ? "Profile updated successfully"
            : "User updated successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        await Axios.post("/admin/users", dataToSend);

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "User created successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      }

      handleCloseModal();
      fetchUsers();
      if (isProfileEdit) {
        fetchCurrentUser();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      Swal.fire({
        icon: "error",
        title: editMode ? "Failed to update user" : "Failed to create user",
        text: error.response?.data?.message || "Please try again later.",
      });
    }
  };

  const handleEdit = (user) => {
    const isOwnProfile = currentUser && user._id === currentUser.userId;

    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      subrole: user.subrole,
      branch: user.branch,
      password: "",
      confirmPassword: "",
    });
    setEditId(user._id);
    setEditMode(true);
    setIsProfileEdit(isOwnProfile && !isAdmin);
    setShowModal(true);
  };

  const handleEditProfile = () => {
    const user = users.find((u) => u._id === currentUser.userId);
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        subrole: user.subrole,
        branch: user.branch,
        password: "",
        confirmPassword: "",
      });
      setEditId(user._id);
      setEditMode(true);
      setIsProfileEdit(true);
      setShowModal(true);
    }
  };

  const handleDelete = async (userId) => {
    if (!isAdmin) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Only administrators can delete users.",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await Axios.delete(`/admin/users/${userId}`);

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
      console.error("Error deleting user:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to delete user",
        text: error.response?.data?.message || "Please try again later.",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditId(null);
    setIsProfileEdit(false);
    setFormData({
      firstName: "",
      lastName: "",
      phone: "+88 ",
      email: "",
      role: "",
      subrole: "",
      branch: "",
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isProfileEdit
                ? "Edit Your Profile"
                : editMode
                ? "Edit User"
                : "Add User"}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                  required
                />
                <input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleChange}
                  className={`border px-3 py-2 rounded w-full ${
                    isProfileEdit ? "bg-gray-100" : ""
                  }`}
                  disabled={isProfileEdit}
                  required={!isProfileEdit}
                />

                {!isProfileEdit && (
                  <>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded w-full bg-white"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Admin">Super Admin</option>
                      <option value="Branch manager">Branch manager</option>
                      <option value="Executive">Executive</option>
                    </select>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded w-full bg-white"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches?.map((branch, idx) => (
                        <option key={idx} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {!isProfileEdit && (
                  <>
                    <select
                      name="subrole"
                      value={formData.subrole}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded w-full bg-white"
                    >
                      <option value="">Select Sub Role</option>
                      <option value="message_sender">
                        Message Subscription
                      </option>
                      <option value="">No Sub Role</option>
                    </select>
                  </>
                )}

                {isProfileEdit && (
                  <>
                    <input
                      value={formData.role}
                      placeholder="Role"
                      className="border px-3 py-2 rounded w-full bg-gray-100"
                      disabled
                    />
                    <input
                      value={formData.branch}
                      placeholder="Branch"
                      className="border px-3 py-2 rounded w-full bg-gray-100"
                      disabled
                    />
                  </>
                )}

                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      editMode
                        ? "New Password (leave blank to keep current)"
                        : "Password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded w-full"
                    autoComplete="off"
                    required={!editMode}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-sm text-gray-500"
                  >
                    {showPassword ? "ðŸ™ˆ" : "ðŸ‘ï¸"}
                  </span>
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="off"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                  required={!editMode || formData.password}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={`px-4 py-2 rounded text-white ${
                    editMode
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {editMode ? "Update" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">
            All Branch Admin Moderators and their details
          </p>
        </div>
        <button
          onClick={handleEditProfile}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Edit My Profile
        </button>
      </div>

      {isAdmin && (
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add New User
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            You can edit your profile information using the "Edit My Profile"
            button above.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded shadow-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Sub Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(isAdmin
              ? filteredUsers
              : users.filter((user) => user._id === currentUser?.userId)
            ).map((user) => (
              <tr
                key={user._id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2">
                  {`${user.firstName} ${user.lastName}`}
                  {currentUser && user._id === currentUser.userId && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">{user?.phone}</td>
                <td className="px-4 py-2">{user?.email}</td>
                <td className="px-4 py-2">{user?.branch}</td>
                <td className="px-4 py-2">{user?.role}</td>
                <td className="px-4 py-2 text-green-600">{user?.subrole}</td>
                <td className="px-4 py-2 space-x-2 flex">
                  <button
                    onClick={() => handleEdit(user)}
                    className="btn w-1/2 m-auto btn-warning btn-sm"
                  >
                    Edit
                  </button>
                  {isAdmin && currentUser?.userId !== user._id && (
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="btn w-1/2 m-auto btn-sm btn-error"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(isAdmin
              ? filteredUsers
              : users.filter((user) => user._id === currentUser?.userId)
            ).length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
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
