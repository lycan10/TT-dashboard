import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "../order/order.css";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Download04FreeIcons,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import ProgressFilter from "../../components/progressfilter/ProgressFilter";
import Pagination from "react-bootstrap/Pagination";
import { useInventories } from "../../context/InventoryContext";
import { useAuth } from "../../context/AuthContext";
import PartSelector from "../../components/repairs/Parts";

const getStatusStyles = (status) => {
  switch (status) {
    case "New Order":
      return { color: "#FFA500", bgColor: "#FFF5E6" };
    case "On shelf":
      return { color: "#007BFF", bgColor: "#E6F0FF" };
    case "Sold":
      return { color: "#17A2B8", bgColor: "#E0F7FA" };
    default:
      return { color: "#6c757d", bgColor: "#f8f9fa" };
  }
};

const Inventory = () => {
  const {
    inventoryPaginationData,
    inventories,
    loading,
    error,
    fetchInventories,
    addInventory,
    updateInventory,
    deleteInventory,
    statusCounts,
    exportInventories,
  } = useInventories();

  const [currentPage, setCurrentPage] = useState(
    inventoryPaginationData.current_page || 1
  );
  const itemsPerPage = inventoryPaginationData.per_page || 10;

  const [selectedStatus, setSelectedStatus] = useState("All");
  const statuses = ["All", "New Order", "On shelf", "Sold"];

  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [parts, setParts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const [inventoryCounts, setInventoryCounts] = useState({
    All: 0,
    "New Order": 0,
    "On shelf": 0,
    Sold: 0,
  });

  const [inventoryFormData, setInventoryFormData] = useState({
    partName: "",
    partNumber: "",
    quantity: 1,
    vendor: "",
    status: "New Order",
    comments: "",
  });

  const [editingInventory, setEditingInventory] = useState(null);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetInventoryFormData();
  };
  const handleShowAddModal = () => setShowAddModal(true);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingInventory(null);
    resetInventoryFormData();
  };
  const handleShowEditModal = () => setShowEditModal(true);

  const resetInventoryFormData = () => {
    setInventoryFormData({
      partName: "",
      partNumber: "",
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
    setInventoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  const increaseQuantity = () => {
    setInventoryFormData((prevData) => ({
      ...prevData,
      quantity: prevData.quantity + 1,
    }));
  };

  const decreaseQuantity = () => {
    if (inventoryFormData.quantity > 1) {
      setInventoryFormData((prevData) => ({
        ...prevData,
        quantity: prevData.quantity - 1,
      }));
    }
  };

  const handleAddSubmit = async () => {
    const success = await addInventory({
      ...inventoryFormData,
      comments: inventoryFormData.comments,
    });
    if (success) {
      handleCloseAddModal();
    }
  };

  const handleEditClick = (inventory) => {
    setEditingInventory(inventory);
    setInventoryFormData({
      partName: inventory.partName || "",
      partNumber: inventory.partNumber || "",
      quantity: inventory.quantity || 1,
      vendor: inventory.vendor || "",
      status: inventory.status || "New Order",
      comments: inventory.comments || "",
    });
    handleShowEditModal();
  };

  const handleEditSubmit = async () => {
    if (!editingInventory) return;

    const success = await updateInventory(editingInventory.id, {
      ...inventoryFormData,
      comments: inventoryFormData.comments,
    });
    if (success) {
      handleCloseEditModal();
    }
  };

  const displayedInventories = inventories;
  const totalPages = inventoryPaginationData.last_page || 1;

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

  useEffect(() => {
    if (statusCounts) {
      setInventoryCounts(statusCounts);
    }
  }, [statusCounts]);

  useEffect(() => {
    const params = {
      page: currentPage,
      perPage: itemsPerPage,
      ...(selectedStatus !== "All" && { status: selectedStatus }),
      sortBy: sortBy,
      sortDirection: sortDirection,
      ...(searchTerm && { search: searchTerm }),
    };
    fetchInventories(params);
  }, [
    selectedStatus,
    sortBy,
    sortDirection,
    currentPage,
    itemsPerPage,
    searchTerm,
  ]);

  useEffect(() => {
    if (
      inventoryPaginationData.current_page &&
      inventoryPaginationData.current_page !== currentPage
    ) {
      setCurrentPage(inventoryPaginationData.current_page);
    }
  }, [inventoryPaginationData.current_page]);

  const countByStatus = (status) => {
    return inventoryCounts[status] || 0;
  };

  const promptDeleteConfirmation = (inventory) => {
    setInventoryToDelete(inventory);
    setShowDeleteConfirmModal(true);
  };

  const handleDownload = async (type) => {
    console.log(`Downloading as ${type}`);
    const params = {
      ...(selectedStatus !== "All" && { status: selectedStatus }),
      sortBy: sortBy,
      sortDirection: sortDirection,
      ...(searchTerm && { search: searchTerm }),
    };
    await exportInventories(type, params);
    setShowDownloadModal(false);
  };

  return (
    <div className="order-page">
      <div className="rightsidebar-navbar">
        <h3>Total Inventory</h3>
        <div className="rightsidebar-button" onClick={handleShowAddModal}>
          <HugeiconsIcon
            icon={Add01Icon}
            size={16}
            color="#ffffff"
            strokeWidth={3}
          />
          <p>New Inventory</p>
        </div>
      </div>

      <div className="order-page-title">
        <h3> Inventory List</h3>
      </div>

      <div className="download-container">
        <div className="search-input-container">
          <HugeiconsIcon icon={Search01Icon} size={16} color="#545454" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div
          className="rightsidebar-button"
          style={{ backgroundColor: "#3c58ae" }}
          onClick={() => setShowDownloadModal(true)}
        >
          <HugeiconsIcon
            icon={Download04FreeIcons}
            size={16}
            color="#ffffff"
            strokeWidth={2}
          />
          <p>Download</p>
        </div>
      </div>

      <div className="custom-line no-margin"></div>

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

      {loading ? (
        <p>Loading inventory...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <div className="order-table-container">
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
                  onClick={() => handleSortClick("partNumber")}
                  style={{ cursor: "pointer" }}
                >
                  Part Number{" "}
                  {sortBy === "partNumber" &&
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
                  {sortBy === "comments" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
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
              {Array.isArray(displayedInventories) &&
              displayedInventories.length === 0 ? (
                <tr>
                  <td colSpan="8">No inventory data available</td>
                </tr>
              ) : (
                Array.isArray(displayedInventories) &&
                displayedInventories.map((inventory) => {
                  const { color, bgColor } = getStatusStyles(inventory.status);
                  return (
                    <tr key={inventory.id}>
                      <td>{inventory.id}</td>
                      <td>{inventory.partName}</td>
                      <td>{inventory.partNumber}</td>
                      <td>{inventory.quantity}</td>
                      <td>{inventory.vendor}</td>
                      <td>{inventory.comments}</td>
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
                          {inventory.status}
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
                              handleEditClick(inventory);
                            }}
                          >
                            Edit
                          </button>
                          {user.name === "admin" && (
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                promptDeleteConfirmation(inventory);
                              }}
                            >
                              Delete
                            </button>
                          )}
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
            <h3>Add New Inventory</h3>{" "}
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
                value={inventoryFormData.partName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="partNumber">Part Number</label>
              <input
                type="text"
                id="partNumber"
                name="partNumber"
                className="input-field"
                value={inventoryFormData.partNumber}
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
                value={inventoryFormData.vendor}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <PartSelector selectedParts={parts} setSelectedParts={setParts} />
              <div className="selected-parts-list">
                {Array.isArray(parts) && parts.length > 0 ? (
                  parts.map((part, index) => (
                    <div key={index} className="selected-part-item">
                      <span>
                        {part.name} (Qty: {part.quantity})
                      </span>
                      <button
                        type="button"
                        className="remove-part-button"
                        onClick={() => {
                          const updatedParts = [...parts];
                          updatedParts.splice(index, 1);
                          setParts(updatedParts);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No parts selected</p>
                )}
              </div>
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
                  value={inventoryFormData.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                      setInventoryFormData((prev) => ({
                        ...prev,
                        quantity: value,
                      }));
                    } else if (value === 0) {
                      setInventoryFormData((prev) => ({
                        ...prev,
                        quantity: 1,
                      }));
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
                value={inventoryFormData.comments}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="input-field"
                value={inventoryFormData.status}
                onChange={handleChange}
              >
                <option>New Order</option>
                <option>On shelf</option>
                <option>Sold</option>
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
            <h3>Edit Inventory</h3>{" "}
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
                value={inventoryFormData.partName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="editPartNumber">Part Number</label>
              <input
                type="text"
                id="editPartNumber"
                name="partNumber"
                className="input-field"
                value={inventoryFormData.partNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <PartSelector selectedParts={parts} setSelectedParts={setParts} />
              <div className="selected-parts-list">
                {Array.isArray(parts) && parts.length > 0 ? (
                  parts.map((part, index) => (
                    <div key={index} className="selected-part-item">
                      <span>
                        {part.name} (Qty: {part.quantity})
                      </span>
                      <button
                        type="button"
                        className="remove-part-button"
                        onClick={() => {
                          const updatedParts = [...parts];
                          updatedParts.splice(index, 1);
                          setParts(updatedParts);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No parts selected</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="editVendor">Vendor</label>
              <input
                type="text"
                id="editVendor"
                name="vendor"
                className="input-field"
                value={inventoryFormData.vendor}
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
                  value={inventoryFormData.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0) {
                      setInventoryFormData((prev) => ({
                        ...prev,
                        quantity: value,
                      }));
                    } else if (value === 0) {
                      setInventoryFormData((prev) => ({
                        ...prev,
                        quantity: 1,
                      }));
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
              <label htmlFor="editComments">Comments</label>
              <textarea
                id="editComments"
                name="comments"
                className="input-field textarea"
                value={inventoryFormData.comments}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="editStatus">Status</label>
              <select
                id="editStatus"
                name="status"
                className="input-field"
                value={inventoryFormData.status}
                onChange={handleChange}
              >
                <option>New Order</option>
                <option>On shelf</option>
                <option>Sold</option>
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
          Are you sure you want to delete the inventory item{" "}
          <strong>{inventoryToDelete?.partName}</strong>?
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
              if (inventoryToDelete) {
                const success = await deleteInventory(inventoryToDelete.id);
                if (success) {
                  console.log(
                    `Inventory item ${inventoryToDelete.id} deleted.`
                  );
                }
                setShowDeleteConfirmModal(false);
                setInventoryToDelete(null);
              }
            }}
          >
            Confirm Delete
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDownloadModal}
        onHide={() => setShowDownloadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Download Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>How would you like to download the data?</p>
          <div className="modal-button-download">
            <Button
              className="download-button"
              variant="outline-primary"
              onClick={() => handleDownload("pdf")}
            >
              PDF
            </Button>
            <Button
              variant="outline-success"
              onClick={() => handleDownload("csv")}
            >
              CSV
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDownloadModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Inventory;
