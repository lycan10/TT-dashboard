import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-bootstrap/Modal";
import "./userManagement.css";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Search01Icon, Delete02Icon, PencilEdit01Icon, LockKeyIcon, UserBlock01Icon, UserCheck01Icon } from "@hugeicons/core-free-icons";
import { useAuth } from "../../context/AuthContext";

const getStatusStyles = (status) => {
  switch (status) {
    case "active":
      return { color: "#28a745", bgColor: "#E8F6EA" };
    case "suspended":
      return { color: "#dc3545", bgColor: "#FDECEA" };
    default:
      return { color: "#6c757d", bgColor: "#f8f9fa" };
  }
};

const UserManagement = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add", "edit", "password"
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "staff",
    status: "active"
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleShowModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user) {
      setFormData({
        name: user.name || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role || "staff",
        status: user.status || "active"
      });
    } else {
      setFormData({
        name: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "staff",
        status: "active"
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((modalType === "add" || modalType === "password") && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const url = modalType === "add" 
      ? `${process.env.REACT_APP_BASE_URL}/api/users` 
      : (modalType === "password" 
          ? `${process.env.REACT_APP_BASE_URL}/api/users/change-password`
          : `${process.env.REACT_APP_BASE_URL}/api/users/${selectedUser.id}`);
    
    const method = modalType === "add" ? "POST" : (modalType === "password" ? "POST" : "PUT");
    
    let body = { ...formData };
    if (modalType === "password") {
        body = { user_id: selectedUser.id, password: formData.password };
    } else {
        delete body.confirmPassword;
        if (modalType === "edit" && !formData.password) {
            delete body.password;
        }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save user");
      }

      handleCloseModal();
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error("Failed to update status");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management-page">
      <div className="rightsidebar-navbar">
        <h3>User Management</h3>
        <div className="rightsidebar-button" onClick={() => handleShowModal("add")}>
          <HugeiconsIcon icon={Add01Icon} size={16} color="#ffffff" strokeWidth={3} />
          <p>New User</p>
        </div>
      </div>

      <div className="search-input-container">
        <HugeiconsIcon icon={Search01Icon} size={16} color="#545454" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="custom-line no-margin"></div>

      {loading ? (
        <p className="p-3">Loading users...</p>
      ) : error ? (
        <p className="p-3 text-danger">Error: {error.message}</p>
      ) : (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const { color, bgColor } = getStatusStyles(u.status);
                return (
                  <tr key={u.id}>
                    <td>{u.name} {u.first_name ? `(${u.first_name} ${u.last_name})` : ""}</td>
                    <td>{u.email}</td>
                    <td className="capitalize">{u.role}</td>
                    <td>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color,
                        backgroundColor: bgColor,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: 500,
                        width: "fit-content",
                        textTransform: "capitalize"
                      }}>
                        {u.status || "active"}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn edit" title="Edit User" onClick={() => handleShowModal("edit", u)}>
                          <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                        </button>
                        <button className="icon-btn password" title="Change Password" onClick={() => handleShowModal("password", u)}>
                          <HugeiconsIcon icon={LockKeyIcon} size={18} />
                        </button>
                        {currentUser.id !== u.id && (
                        <button className={`icon-btn ${u.status === "suspended" ? "activate" : "suspend"}`} 
                                title={u.status === "suspended" ? "Activate User" : "Suspend User"}
                                onClick={() => toggleStatus(u)}>
                          <HugeiconsIcon icon={u.status === "suspended" ? UserCheck01Icon : UserBlock01Icon} size={18} />
                        </button>
                        )}
                        {/*
                          <button className="icon-btn delete" title="Delete User" onClick={() => handleDelete(u.id)}>
                            <HugeiconsIcon icon={Delete02Icon} size={18} />
                          </button>
                        */}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <h3>{modalType === "add" ? "Add New User" : (modalType === "password" ? "Change Password" : "Edit User")}</h3>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form" onSubmit={handleSubmit}>
            {modalType !== "password" && (
              <>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="name" disabled readOnly className="input-field" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group col">
                    <label>First Name</label>
                    <input type="text" name="first_name" className="input-field" value={formData.first_name} onChange={handleInputChange} />
                  </div>
                  <div className="form-group col">
                    <label>Last Name</label>
                    <input type="text" name="last_name" className="input-field" value={formData.last_name} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" className="input-field" value={formData.email} onChange={handleInputChange} required />
                </div>
                {currentUser.id !== selectedUser?.id && (<div className="form-group">
                  <label>Role</label>
                  <select name="role" className="input-field" value={formData.role} onChange={handleInputChange}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>)}
              </>
            )}
            
            {(modalType === "add" || modalType === "password") && (
              <>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" className="input-field" value={formData.password} onChange={handleInputChange} required={modalType === "add" || modalType === "password"} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" name="confirmPassword" className="input-field" value={formData.confirmPassword} onChange={handleInputChange} required={modalType === "add" || modalType === "password"} />
                </div>
              </>
            )}

            <div className="modal-footer-btns">
              <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserManagement;
