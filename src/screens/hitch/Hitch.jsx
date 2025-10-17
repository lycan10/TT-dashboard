import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "../order/order.css";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import ProgressFilter from "../../components/progressfilter/ProgressFilter";
import Pagination from "react-bootstrap/Pagination";
import { useHitches } from "../../context/HitchContext";
import { useAuth } from "../../context/AuthContext";
import HitchSelector from "../../components/repairs/HitchSelector";
import PartSelector from "../../components/repairs/Parts";

const getStatusStyles = (status) => {
  switch (status) {
    case "New Order":
      return { color: "#FFA500", bgColor: "#FFF5E6" };
    case "Quoted":
      return { color: "#007BFF", bgColor: "#E6F0FF" };
    case "Called":
      return { color: "#6f42c1", bgColor: "#f3e8ff" };
    case "Awaiting parts":
      return { color: "#fd7e14", bgColor: "#fff3e0" };
    case "Rejected":
      return { color: "#dc3545", bgColor: "#fdecea" };
    case "Scheduled":
      return { color: "#17A2B8", bgColor: "#E0F7FA" };
    case "Order Complete":
      return { color: "#28a745", bgColor: "#E8F6EA" };
    case "All":
    default:
      return { color: "#6c757d", bgColor: "#f8f9fa" };
  }
};

const Hitch = () => {
  const {
    hitchPaginationData,
    hitches,
    loading,
    error,
    fetchHitches,
    addHitch,
    updateHitch,
    deleteHitch,
    statusCounts,
  } = useHitches();

  const [currentPage, setCurrentPage] = useState(
    hitchPaginationData.current_page || 1
  );
  const itemsPerPage = hitchPaginationData.per_page || 10;

  const [selectedStatus, setSelectedStatus] = useState("All");
  const statuses = [
    "All",
    "New Order",
    "Quoted",
    "Called",
    "Awaiting parts",
    "Rejected",
    "Scheduled",
    "Order Complete",
  ];

  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [hitchToDelete, setHitchToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const [repairs, setRepairs] = useState([]);
  const [parts, setParts] = useState([]);

  const [hitchCounts, setHitchCounts] = useState({
    All: 0,
    "New Order": 0,
    Quoted: 0,
    Called: 0,
    "Awaiting parts": 0,
    Rejected: 0,
    Scheduled: 0,
    "Order Complete": 0,
  });

  const [hitchFormData, setHitchFormData] = useState({
    customerName: "",
    phoneNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    jobDescription: [],
    partsNeeded: [],
    partNumber: "",
    dateIn: "",
    dateOut: "",
    price: "",
    comments: "",
    status: "New Order",
  });

  const [editingHitch, setEditingHitch] = useState(null);

  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
    setSelectedItem({});
  };
  const handleShowInfoModal = () => setShowInfoModal(true);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetHitchFormData();
  };
  const handleShowAddModal = () => setShowAddModal(true);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingHitch(null);
    resetHitchFormData();
  };
  const handleShowEditModal = () => setShowEditModal(true);

  const resetHitchFormData = () => {
    setHitchFormData({
      customerName: "",
      phoneNumber: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      jobDescription: [],
      partsNeeded: [],
      partNumber: "",
      dateIn: "",
      dateOut: "",
      price: "",
      comments: "",
      status: "New Order",
    });
    setRepairs([]);
    setParts([]);
  };

  const handleFilterClick = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHitchFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async () => {
    const success = await addHitch({
      ...hitchFormData,
      jobDescription: repairs,
      partsNeeded: parts,
    });
    if (success) {
      handleCloseAddModal();
    }
  };

  const handleEditClick = (hitch) => {
    setEditingHitch(hitch);
    setHitchFormData({
      customerName: hitch.customerName || "",
      phoneNumber: hitch.phoneNumber || "",
      vehicleMake: hitch.vehicleMake || "",
      vehicleModel: hitch.vehicleModel || "",
      vehicleYear: hitch.vehicleYear || "",
      jobDescription: hitch.jobDescription || [],
      partsNeeded: hitch.partsNeeded || [],
      partNumber: hitch.partNumber || "",
      dateIn: hitch.dateIn || "",
      dateOut: hitch.dateOut || "",
      price: hitch.price || "",
      comments: hitch.comments || "",
      status: hitch.status || "New Order",
    });
    setRepairs(hitch.jobDescription || []);
    setParts(hitch.partsNeeded || []);
    handleShowEditModal();
  };

  const handleEditSubmit = async () => {
    if (!editingHitch) return;

    const success = await updateHitch(editingHitch.id, {
      ...hitchFormData,
      jobDescription: repairs,
      partsNeeded: parts,
    });
    if (success) {
      handleCloseEditModal();
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteHitch(id);
    if (success) {
      console.log(`Hitch request with ID ${id} deleted successfully.`);
    }
  };

  const displayedHitches = hitches;
  const totalPages = hitchPaginationData.last_page || 1;

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

  // const fetchStatusCounts = async () => {
  //   try {
  //     const API_URL = `${process.env.REACT_APP_BASE_URL}/api/orders/counts`;

  //     const response = await fetch(`${API_URL}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...(token && { Authorization: `Bearer ${token}` }),
  //       },
  //     });
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data = await response.json();
  //     setOrderCounts(data);
  //   } catch (error) {
  //     console.error("Error fetching status counts:", error);
  //   }
  // };

  useEffect(() => {
    const params = {
      page: currentPage,
      perPage: itemsPerPage,
      ...(selectedStatus !== "All" && { status: selectedStatus }),
      sortBy: sortBy,
      sortDirection: sortDirection,
      ...(searchTerm && { search: searchTerm }),
    };
    fetchHitches(params);
  }, [
    selectedStatus,
    sortBy,
    sortDirection,
    currentPage,
    itemsPerPage,
    searchTerm,
  ]);

  useEffect(() => {
    // fetchStatusCounts();
  }, []);

  useEffect(() => {
    if (
      hitchPaginationData.current_page &&
      hitchPaginationData.current_page !== currentPage
    ) {
      setCurrentPage(hitchPaginationData.current_page);
    }
    setHitchCounts(statusCounts);
  }, [hitchPaginationData.current_page, statusCounts]);

  const countByStatus = (status) => {
    return hitchCounts[status] || 0;
  };

  const handleDownload = (type) => {
    console.log(`Downloading as ${type}`);
    setShowDownloadModal(false);
  };

  return (
    <div className="order-page">
      <div className="rightsidebar-navbar">
        <h3>Total Trailer</h3>
        <div className="rightsidebar-button" onClick={handleShowAddModal}>
          <HugeiconsIcon
            icon={Add01Icon}
            size={16}
            color="#ffffff"
            strokeWidth={3}
          />
          <p>New Hitch Request</p>
        </div>
      </div>

      <div className="order-page-title">
        <h3> Hitch List</h3>
      </div>

      <div className="download-container">
        <div className="search-input-container">
          <HugeiconsIcon icon={Search01Icon} size={16} color="#545454" />
          <input
            type="text"
            placeholder="Search hitch requests..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        {/* <div
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
        </div> */}
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
        <p>Loading hitch requests...</p>
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
                  onClick={() => handleSortClick("customerName")}
                  style={{ cursor: "pointer" }}
                >
                  Customer Name{" "}
                  {sortBy === "customerName" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("phoneNumber")}
                  style={{ cursor: "pointer" }}
                >
                  Phone Number{" "}
                  {sortBy === "phoneNumber" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("vehicleMake")}
                  style={{ cursor: "pointer" }}
                >
                  Vehicle Make{" "}
                  {sortBy === "vehicleMake" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("vehicleModel")}
                  style={{ cursor: "pointer" }}
                >
                  Vehicle Model{" "}
                  {sortBy === "vehicleModel" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("vehicleYear")}
                  style={{ cursor: "pointer" }}
                >
                  Vehicle year{" "}
                  {sortBy === "vehicleYear" &&
                    (sortDirection === "asc" ? "▲" : "▼")}
                </th>
                <th
                  onClick={() => handleSortClick("jobDescription")}
                  style={{ cursor: "pointer" }}
                >
                  Job description{" "}
                  {sortBy === "jobDescription" &&
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
                  onClick={() => handleSortClick("status")}
                  style={{ cursor: "pointer" }}
                >
                  Status{" "}
                  {sortBy === "status" && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(displayedHitches) &&
              displayedHitches.length === 0 ? (
                <tr>
                  <td colSpan="9">No data available</td>
                </tr>
              ) : (
                Array.isArray(displayedHitches) &&
                displayedHitches.map((hitch) => {
                  const { color, bgColor } = getStatusStyles(hitch.status);
                  return (
                    <tr
                      key={hitch.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedItem(hitch);
                        handleShowInfoModal();
                      }}
                    >
                      <td>{hitch.id}</td>
                      <td>{hitch.customerName}</td>
                      <td>{hitch.phoneNumber}</td>
                      <td>{hitch.vehicleMake}</td>
                      <td>{hitch.vehicleModel}</td>
                      <td>{hitch.vehicleYear}</td>
                      <td>
                        {Array.isArray(hitch.jobDescription)
                          ? hitch.jobDescription.join(", ")
                          : hitch.jobDescription}
                      </td>{" "}
                      {/* Changed from order.quantity and added array handling */}
                      <td>{hitch.partNumber}</td>
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
                          {hitch.status}
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
            <h3>Add Hitch Request</h3>{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form">
            <div className="form-group">
              <label htmlFor="customerName">Customer name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                className="input-field"
                value={hitchFormData.customerName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone number</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                className="input-field"
                value={hitchFormData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicleMake">Vehicle make</label>
              <input
                type="text"
                id="vehicleMake"
                name="vehicleMake"
                className="input-field"
                value={hitchFormData.vehicleMake}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicleModel">Vehicle model</label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                className="input-field"
                value={hitchFormData.vehicleModel}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicleYear">Vehicle year</label>
              <input
                type="text"
                id="vehicleYear"
                name="vehicleYear"
                className="input-field"
                value={hitchFormData.vehicleYear}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <HitchSelector
                selectedHitch={repairs}
                setSelectedHitch={setRepairs}
              />
              <p className="pb-2">Selected Hitch Job:</p>
              <div className="selected-repairs-list">
                {Array.isArray(repairs) && repairs.length > 0 ? (
                  repairs.map((repair, index) => (
                    <div key={index} className="selected-repair-item">
                      <span>{repair}</span>
                      <button
                        type="button"
                        className="remove-repair-button"
                        onClick={() => {
                          const updatedRepairs = repairs.filter(
                            (_, i) => i !== index
                          );
                          setRepairs(updatedRepairs);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No job selected</p>
                )}
              </div>
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
              <label htmlFor="partNumber">Part number</label>
              <input
                type="text"
                id="partNumber"
                name="partNumber"
                className="input-field"
                value={hitchFormData.partNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateIn">Date In</label>
              <input
                type="date"
                id="dateIn"
                name="dateIn"
                className="input-field"
                value={hitchFormData.dateIn}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOut">Date Out</label>
              <input
                type="date"
                id="dateOut"
                name="dateOut"
                className="input-field"
                value={hitchFormData.dateOut}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="text"
                id="price"
                name="price"
                className="input-field"
                value={hitchFormData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                name="comments"
                className="input-field textarea"
                value={hitchFormData.comments}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="input-field"
                value={hitchFormData.status}
                onChange={handleChange}
              >
                <option>New Order</option>
                <option>Quoted</option>
                <option>Called</option>
                <option>Awaiting parts</option>
                <option>Rejected</option>
                <option>Scheduled</option>
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
            <h3>Edit Hitch Request</h3>{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form">
            <div className="form-group">
              <label htmlFor="customerName">Customer name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                className="input-field"
                value={hitchFormData.customerName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone number</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                className="input-field"
                value={hitchFormData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicleMake">Vehicle make</label>
              <input
                type="text"
                id="vehicleMake"
                name="vehicleMake"
                className="input-field"
                value={hitchFormData.vehicleMake}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicleModel">Vehicle model</label>
              <input
                type="text"
                id="vehicleModel"
                name="vehicleModel"
                className="input-field"
                value={hitchFormData.vehicleModel}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="vehicleYear">Vehicle year</label>
              <input
                type="text"
                id="vehicleYear"
                name="vehicleYear"
                className="input-field"
                value={hitchFormData.vehicleYear}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <HitchSelector
                selectedHitch={repairs}
                setSelectedHitch={setRepairs}
              />
              <p className="pb-2">Selected Hitch Job:</p>
              <div className="selected-repairs-list">
                {Array.isArray(repairs) && repairs.length > 0 ? (
                  repairs.map((repair, index) => (
                    <div key={index} className="selected-repair-item">
                      <span>{repair}</span>
                      <button
                        type="button"
                        className="remove-repair-button"
                        onClick={() => {
                          const updatedRepairs = repairs.filter(
                            (_, i) => i !== index
                          );
                          setRepairs(updatedRepairs);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No job selected</p>
                )}
              </div>
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
              <label htmlFor="partNumber">Part number</label>
              <input
                type="text"
                id="partNumber"
                name="partNumber"
                className="input-field"
                value={hitchFormData.partNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateIn">Date In</label>
              <input
                type="date"
                id="dateIn"
                name="dateIn"
                className="input-field"
                value={hitchFormData.dateIn}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOut">Date Out</label>
              <input
                type="date"
                id="dateOut"
                name="dateOut"
                className="input-field"
                value={hitchFormData.dateOut}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="text"
                id="price"
                name="price"
                className="input-field"
                value={hitchFormData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                name="comments"
                className="input-field textarea"
                value={hitchFormData.comments}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="input-field"
                value={hitchFormData.status}
                onChange={handleChange}
              >
                <option>New Order</option>
                <option>Quoted</option>
                <option>Called</option>
                <option>Awaiting parts</option>
                <option>Rejected</option>
                <option>Scheduled</option>
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
            Save
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showInfoModal}
        onHide={handleCloseInfoModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Hitch Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <div className="info-group">
                <strong>Customer Name:</strong>
                <p>{selectedItem.customerName}</p>
              </div>
              <div className="info-group">
                <strong>Phone Number:</strong>
                <p>{selectedItem.phoneNumber}</p>
              </div>
              <div className="info-group">
                <strong>Vehicle make:</strong>
                <p>{selectedItem.vehicleMake}</p>
              </div>
              <div className="info-group">
                <strong>Vehicle model:</strong>
                <p>{selectedItem.vehicleModel}</p>
              </div>
              <div className="info-group">
                <strong>Vehicle year:</strong>
                <p>{selectedItem.vehicleYear}</p>
              </div>

              <div className="info-group">
                <strong>Date In:</strong>
                <p>{selectedItem.dateIn}</p>
              </div>
              <div className="info-group">
                <strong>Date Out:</strong>
                <p>{selectedItem.dateOut}</p>
              </div>
              <div className="info-group">
                <strong>Price:</strong>
                <p>{selectedItem.price}</p>
              </div>
              <div className="info-group">
                <strong>Status:</strong>
                <p>{selectedItem.status}</p>
              </div>
              <div className="info-group">
                <strong>Job description:</strong>
                <p>
                  {Array.isArray(selectedItem.jobDescription)
                    ? selectedItem.jobDescription.join(", ")
                    : selectedItem.jobDescription}{" "}
                  // Changed from repairNeeded
                </p>
              </div>
              <div className="info-group">
                <strong>Parts Needed:</strong>
                <p>
                  {Array.isArray(selectedItem.partsNeeded)
                    ? selectedItem.partsNeeded
                        .map((part) => `${part.name} (Qty: ${part.quantity})`)
                        .join(", ")
                    : selectedItem.partsNeeded}
                </p>
              </div>
              {selectedItem.comments && (
                <div className="info-group">
                  <strong>Comments:</strong>
                  <p>{selectedItem.comments}</p>
                </div>
              )}

              {selectedItem.author && (
                <div className="info-group">
                  <strong>Created By:</strong>
                  <p>{selectedItem.author.name}</p>
                </div>
              )}

              {selectedItem.history && selectedItem.history.length > 0 && (
                <div className="info-group">
                  <strong>Hitch Request History:</strong>
                  <ul>
                    {selectedItem.history.map((historyEntry) => (
                      <li key={historyEntry.id}>
                        {historyEntry.changes &&
                        typeof historyEntry.changes === "string" ? (
                          JSON.parse(historyEntry.changes).map(
                            (change, index) => <p key={index}>{change}</p>
                          )
                        ) : (
                          <p>{historyEntry.changes}</p>
                        )}
                        <small>
                          by{" "}
                          {historyEntry.user
                            ? historyEntry.user.name
                            : "Unknown User"}{" "}
                          on{" "}
                          {new Date(historyEntry.created_at).toLocaleString()}
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={handleCloseInfoModal}>
            Cancel
          </button>
          {user.name === "admin" && (
            <button
              className="btn-danger"
              onClick={() => handleDelete(selectedItem.id)}
            >
              Delete
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() => {
              handleCloseInfoModal();
              handleEditClick(selectedItem);
            }}
          >
            Edit
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
          Are you sure you want to delete the hitch request{" "}
          <strong>{hitchToDelete?.customerName}</strong>?
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
              if (hitchToDelete) {
                const success = await deleteHitch(hitchToDelete.id);
                if (success) {
                  console.log(`Hitch request ${hitchToDelete.id} deleted.`);
                }
                setShowDeleteConfirmModal(false);
                setHitchToDelete(null);
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

export default Hitch;
