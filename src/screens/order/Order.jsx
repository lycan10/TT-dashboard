import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import "./order.css";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import ProgressFilter from "../../components/progressfilter/ProgressFilter";
import Pagination from "react-bootstrap/Pagination";
import { useOrders } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";

const getStatusStyles = (status) => {
  switch (status) {
    case "New Order":
      return { color: "#FFA500", bgColor: "#FFF5E6" };
    case "Processing":
      return { color: "#007BFF", bgColor: "#E6F0FF" };
    case "Shipped":
      return { color: "#17A2B8", bgColor: "#E0F7FA" };
    case "Delivered":
      return { color: "#28a745", bgColor: "#E8F6EA" };
    case "Order Complete":
      return { color: "#20c997", bgColor: "#E6FFFA" };
    default:
      return { color: "#6c757d", bgColor: "#f8f9fa" };
  }
};

const Order = () => {
  const {
    orderPaginationData,
    orders,
    loading,
    error,
    fetchOrders,
    addOrder,
    updateOrder,
    deleteOrder,
  } = useOrders();

  const { token } = useAuth();


  const [currentPage, setCurrentPage] = useState(
    orderPaginationData.current_page || 1
  );
  const itemsPerPage = orderPaginationData.per_page || 10;

  const [selectedStatus, setSelectedStatus] = useState("All");
  const statuses = [
    "All",
    "New Order",
    "Processing",
    "Shipped",
    "Delivered",
    "Order Complete",
  ];

  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const [orderCounts, setOrderCounts] = useState({
    All: 0,
    "New Order": 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    "Order Complete": 0,
  });

  const [orderFormData, setOrderFormData] = useState({
    partName: "",
    quantity: 1,
    vendor: "",
    status: "New Order",
    comments: "",
  });

  const [editingOrder, setEditingOrder] = useState(null);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetOrderFormData();
  };
  const handleShowAddModal = () => setShowAddModal(true);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingOrder(null);
    resetOrderFormData();
  };
  const handleShowEditModal = () => setShowEditModal(true);

  const resetOrderFormData = () => {
    setOrderFormData({
      partName: "",
      quantity: 1,
      vendor: "",
      status: "New Order",
      comments: "",
    });
  };

  const handleFilterClick = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData((prev) => ({ ...prev, [name]: value }));
  };

  const increaseQuantity = () => {
    setOrderFormData((prevData) => ({
      ...prevData,
      quantity: prevData.quantity + 1,
    }));
  };

  const decreaseQuantity = () => {
    if (orderFormData.quantity > 1) {
      setOrderFormData((prevData) => ({
        ...prevData,
        quantity: prevData.quantity - 1,
      }));
    }
  };

  const handleAddSubmit = async () => {
    const success = await addOrder({
        ...orderFormData,
        comments: orderFormData.comments
    });
    if (success) {
      handleCloseAddModal(); 
      fetchStatusCounts(); 
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order);
    setOrderFormData({
      partName: order.partName || "",
      quantity: order.quantity || 1,
      vendor: order.vendor || "",
      status: order.status || "New Order",
      comments: order.comments || "",
    });
    handleShowEditModal();
  };

  const handleEditSubmit = async () => {
    if (!editingOrder) return;

    const success = await updateOrder(editingOrder.id, {
        ...orderFormData,
        comments: orderFormData.comments
    });
    if (success) {
      handleCloseEditModal(); 
      fetchStatusCounts(); 
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteOrder(id); 
    if (success) {
      console.log(`Order with ID ${id} deleted successfully.`);
      fetchStatusCounts();
    }
  };

  const displayedOrders = orders; 
  const totalPages = orderPaginationData.last_page || 1; 

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSortClick = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column); 
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); 
  };

  const fetchStatusCounts = async () => {
    try {
      const API_URL = `${process.env.REACT_APP_BASE_URL}/api/orders/counts`;

      const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrderCounts(data); 
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };


  useEffect(() => {
    const params = {
      page: currentPage,
      perPage: itemsPerPage,
      ...(selectedStatus !== "All" && { status: selectedStatus }), 
      sortBy: sortBy,
      sortDirection: sortDirection,
      ...(searchTerm && { search: searchTerm }), 
    };
    fetchOrders(params);
  }, [
    selectedStatus,
    sortBy,
    sortDirection,
    currentPage,
    itemsPerPage,
    fetchOrders,
    searchTerm,
  ]);

  useEffect(() => {
    fetchStatusCounts();
  }, []);


  useEffect(() => {
    if (
      orderPaginationData.current_page &&
      orderPaginationData.current_page !== currentPage
    ) {
      setCurrentPage(orderPaginationData.current_page);
    }
  }, [orderPaginationData.current_page]);

  const countByStatus = (status) => {
    return orderCounts[status] || 0;
  };

  const promptDeleteConfirmation = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirmModal(true);
  };

  return (
    <div className="order-page">
      <div className="rightsidebar-navbar">
        <h3>Total Orders</h3> {/* Updated title */}

        <div className="rightsidebar-button" onClick={handleShowAddModal}>
          <HugeiconsIcon
            icon={Add01Icon}
            size={16}
            color="#ffffff"
            strokeWidth={3}
          />
          <p>New Order</p>
        </div>
      </div>

      <div className="order-page-title">
        <h3>Order List</h3>
      </div>

      {/* Search Input */}
      <div className="search-input-container">
        <HugeiconsIcon icon={Search01Icon} size={16} color="#545454" />
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="custom-line no-margin"></div>

      {/* Status Filters */}
      <div className="rightsidebar-filter-progress">
        {statuses.map((status) => (
          <div
            key={status}
            onClick={() => handleFilterClick(status)}
            style={{ cursor: "pointer" }}
          >
            <ProgressFilter
              title={status}
              count={countByStatus(status)}
              bgColor={selectedStatus === status ? "#333" : "#f1f1f1"}
              color={selectedStatus === status ? "#fff" : "#000"}
            />
          </div>
        ))}
      </div>

      {/* Order Table */}
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <div className="order-table-container" s>
          <table className="order-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSortClick("id")}
                  style={{ cursor: "pointer" }}
                >
                  # {sortBy === "id" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("partName")}
                  style={{ cursor: "pointer" }}
                >
                  Part Name{" "}
                  {sortBy === "partName" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("quantity")}
                  style={{ cursor: "pointer" }}
                >
                  Quantity{" "}
                  {sortBy === "quantity" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("vendor")}
                  style={{ cursor: "pointer" }}
                >
                  Vendor{" "}
                  {sortBy === "vendor" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("comments")}
                  style={{ cursor: "pointer" }}
                >
                  Comments{" "}
                  {sortBy === "comments" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("status")}
                  style={{ cursor: "pointer" }}
                >
                  Status{" "}
                  {sortBy === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(displayedOrders) &&
              displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7">No data available</td>
                </tr>
              ) : (
                Array.isArray(displayedOrders) &&
                displayedOrders.map((order) => {
                  const { color, bgColor } = getStatusStyles(order.status);
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.partName}</td>
                      <td>{order.quantity}</td>
                      <td>{order.vendor}</td>
                      <td>{order.comments}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color,
                            backgroundColor: bgColor,
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: 500,
                            width: "fit-content",
                          }}
                        >
                          {order.status}
                        </div>
                      </td>
                      <td>
                        <div
                          className="action-buttons"
                          style={{ display: "flex", gap: "8px" }}
                        >
                          <button
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(order);
                            }}
                          >
                            Edit
                          </button>
                          {user.name === "admin" && (
                          <button
                            className="delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              promptDeleteConfirmation(order);
                            }}
                          >
                            Delete
                          </button>)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="custom-grid-pagination table">
        <Pagination>
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>

      <Modal
        show={showAddModal}
        onHide={handleCloseAddModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {" "}
            <h3>Add New Order</h3>{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form">
            <div className="form-group">
              <label htmlFor="partName">Part Name</label>
              <input
                type="text"
                id="partName"
                name="partName"
                className="input-field"
                value={orderFormData.partName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="vendor">Vendor</label>
              <input
                type="text"
                id="vendor"
                name="vendor"
                className="input-field"
                value={orderFormData.vendor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <div className="quantity-container">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="input-field quantity-input"
                  value={orderFormData.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                      setOrderFormData((prev) => ({
                        ...prev,
                        quantity: value,
                      }));
                    } else if (value === 0) {
                      setOrderFormData((prev) => ({ ...prev, quantity: 1 }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                name="comments"
                className="input-field textarea"
                value={orderFormData.comments}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="input-field"
                value={orderFormData.status}
                onChange={handleChange}
              >
                <option>New Order</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Order Complete</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={handleCloseAddModal}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleAddSubmit}>
            Save
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {" "}
            <h3>Edit Order</h3>{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form">
            <div className="form-group">
              <label htmlFor="editPartName">Part Name</label>
              <input
                type="text"
                id="editPartName"
                name="partName"
                className="input-field"
                value={orderFormData.partName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="editVendor">Vendor</label>
              <input
                type="text"
                id="editVendor"
                name="vendor"
                className="input-field"
                value={orderFormData.vendor}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="editQuantity">Quantity</label>
              <div className="quantity-container">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                <input
                  type="number"
                  id="editQuantity"
                  name="quantity"
                  className="input-field quantity-input"
                  value={orderFormData.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                      setOrderFormData((prev) => ({
                        ...prev,
                        quantity: value,
                      }));
                    } else if (value === 0) {
                      setOrderFormData((prev) => ({ ...prev, quantity: 1 }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            </div>

             {/* Added Comments Input for Edit Form */}
            <div className="form-group">
              <label htmlFor="editComments">Comments</label>
              <textarea
                id="editComments"
                name="comments"
                className="input-field textarea"
                value={orderFormData.comments}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="editStatus">Status</label>
              <select
                id="editStatus"
                name="status"
                className="input-field"
                value={orderFormData.status}
                onChange={handleChange}
              >
                <option>New Order</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Order Complete</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={handleCloseEditModal}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleEditSubmit}>
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirmModal}
        onHide={() => setShowDeleteConfirmModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the order{" "}
          <strong>{orderToDelete?.partName}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn-secondary"
            onClick={() => setShowDeleteConfirmModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={async () => {
              if (orderToDelete) {
                const success = await deleteOrder(orderToDelete.id);
                if (success) {
                  console.log(`Order ${orderToDelete.id} deleted.`);
                }
                setShowDeleteConfirmModal(false);
                setOrderToDelete(null);
              }
            }}
          >
            Confirm Delete
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Order;
