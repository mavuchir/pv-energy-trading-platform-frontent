"use client"

import { useState, useEffect } from "react"
import {
  FaUsers,
  FaUserPlus,
  FaUserEdit,
  FaUserMinus,
  FaSearch,
  FaFilter,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa"
import AdminService from "../services/AdminService"

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "household",
    status: "active",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await AdminService.getUsers({ filter })
      setUsers(response.users || [])
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again.")

      // Fallback data for demonstration
      setUsers([
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
          role: "household",
          status: "active",
          lastLogin: "2023-06-15T10:30:00Z",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane.smith@example.com",
          role: "household",
          status: "active",
          lastLogin: "2023-06-14T15:45:00Z",
        },
        {
          id: 3,
          name: "Robert Johnson",
          email: "robert.j@example.com",
          role: "admin",
          status: "active",
          lastLogin: "2023-06-15T09:20:00Z",
        },
        {
          id: 4,
          name: "Emily Davis",
          email: "emily.d@example.com",
          role: "household",
          status: "inactive",
          lastLogin: "2023-06-10T11:15:00Z",
        },
        {
          id: 5,
          name: "Michael Wilson",
          email: "michael.w@example.com",
          role: "household",
          status: "active",
          lastLogin: "2023-06-15T08:30:00Z",
        },
        {
          id: 6,
          name: "Sarah Brown",
          email: "sarah.b@example.com",
          role: "household",
          status: "active",
          lastLogin: "2023-06-14T13:10:00Z",
        },
        {
          id: 7,
          name: "David Miller",
          email: "david.m@example.com",
          role: "household",
          status: "inactive",
          lastLogin: "2023-06-08T16:20:00Z",
        },
        {
          id: 8,
          name: "Lisa Taylor",
          email: "lisa.t@example.com",
          role: "admin",
          status: "active",
          lastLogin: "2023-06-15T11:45:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      setError(null)

      await AdminService.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        password: formData.password,
      })

      setSuccess("User added successfully")
      setTimeout(() => setSuccess(null), 3000)

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        role: "household",
        status: "active",
        password: "",
        confirmPassword: "",
      })
      setShowAddModal(false)

      // Refresh user list
      fetchUsers()
    } catch (err) {
      console.error("Error adding user:", err)
      setError("Failed to add user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async () => {
    try {
      setLoading(true)
      setError(null)

      await AdminService.updateUser(currentUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      })

      setSuccess("User updated successfully")
      setTimeout(() => setSuccess(null), 3000)

      // Reset form and close modal
      setCurrentUser(null)
      setShowEditModal(false)

      // Refresh user list
      fetchUsers()
    } catch (err) {
      console.error("Error updating user:", err)
      setError("Failed to update user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      setLoading(true)
      setError(null)

      await AdminService.deleteUser(userId)

      setSuccess("User deleted successfully")
      setTimeout(() => setSuccess(null), 3000)

      // Refresh user list
      fetchUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
      setError("Failed to delete user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (user) => {
    setCurrentUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
      confirmPassword: "",
    })
    setShowEditModal(true)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filter === "all" ||
        (filter === "admin" && user.role === "admin") ||
        (filter === "household" && user.role === "household") ||
        (filter === "active" && user.status === "active") ||
        (filter === "inactive" && user.status === "inactive")),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-teal-600">User Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700"
            >
              <FaUserPlus className="mr-2" />
              Add User
            </button>

            <button
              onClick={fetchUsers}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaSync className={loading ? "mr-2 animate-spin" : "mr-2"} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-green-600">
              <FaCheckCircle className="mr-2" />
              <p>{success}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
            <div className="flex items-center mb-2 md:mb-0">
              <FaUsers className="text-teal-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">System Users</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admins</option>
                  <option value="household">Households</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">{user.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openEditModal(user)} className="text-teal-600 hover:text-teal-900 mr-3">
                          <FaUserEdit />
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                          <FaUserMinus />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Add New User</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="household">Household</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Edit User</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="household">Household</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
