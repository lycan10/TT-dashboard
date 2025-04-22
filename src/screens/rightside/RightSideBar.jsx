import React, { useState, useEffect } from "react";
import "./rightsidebar.css";
import Navbar from "../../components/navbar/Navbar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar02Icon,
  FireIcon,
  ZapIcon,
  Coffee02Icon,
  GridViewIcon,
  LeftToRightListBulletIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import Priority from "../../components/priority/Priority";
import Modal from "react-bootstrap/Modal";
import RepairSelector from "../../components/repairs/Repairs";
import PartSelector from "../../components/repairs/Parts";
import ProgressFilter from "../../components/progressfilter/ProgressFilter";
import Pagination from "react-bootstrap/Pagination";
import Order from "./../order/Order";
import { useTasks } from "../../context/TaskContext";

const getPriorityStyles = (priority) => {
  switch (priority) {
    case "High":
      return { color: "red", bgColor: "#FFF2F2", icon: FireIcon };
    case "Medium":
      return { color: "orange", bgColor: "lightyellow", icon: ZapIcon };
    case "Low":
      return { color: "green", bgColor: "#EAFAEA", icon: Coffee02Icon };
    default:
      return { color: "black", bgColor: "white" };
  }
};

const RightSideBar = ({ selected }) => {
  const {
    taskPaginationData,
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [currentPage, setCurrentPage] = useState(
    taskPaginationData.current_page || 1
  );
  const itemsPerPage = taskPaginationData.per_page || 12;

  const [selectedStatus, setSelectedStatus] = useState("All");
  const statuses = [
    "All",
    "New",
    "In progress",
    "Repair done",
    "Called",
    "Pending",
    "Completed",
  ];

  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const [viewMode, setViewMode] = useState("table");

  const [repairs, setRepairs] = useState([]);
  const [parts, setParts] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetFormData();
  };
  const handleShowAddModal = () => setShowAddModal(true);

  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
    setSelectedItem({});
  };
  const handleShowInfoModal = () => setShowInfoModal(true);

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    resetFormData();
    setSelectedItem({});
  };
  const handleShowEditModal = () => setShowEditModal(true);

  const [formData, setFormData] = useState({
    customerName: "",
    dateIn: "",
    dateOut: "",
    progress: "New",
    priority: "Low",
    comments: "",
    partsNeeded: [],
    repairNeeded: [],
  });

  const [selectedItem, setSelectedItem] = useState({});

  const resetFormData = () => {
    setFormData({
      customerName: "",
      dateIn: "",
      dateOut: "",
      progress: "New",
      priority: "Low",
      comments: "",
      partsNeeded: [],
      repairNeeded: [],
    });
    setRepairs([]);
    setParts([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async () => {
    const finalData = {
      ...formData,
      repairNeeded: repairs,
      partsNeeded: parts,
    };
    const success = await addTask(finalData);
    if (success) {
      handleCloseAddModal();
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedItem.id) return;
    const finalData = {
      ...formData,
      repairNeeded: repairs,
      partsNeeded: parts,
    };
    const success = await updateTask(selectedItem.id, finalData);
    if (success) {
      handleCloseEditModal();
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteTask(id);
    if (success) {
      handleCloseInfoModal();
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormData({
      customerName: item.customerName || "",
      dateIn: item.dateIn || "",
      dateOut: item.dateOut || "",
      progress: item.progress || "New",
      comments: item.comments || "",
      priority: item.priority || "Low",
      partsNeeded: item.partsNeeded || [],
      repairNeeded: item.repairNeeded || [],
    });
    setRepairs(item.repairNeeded || []);
    setParts(item.partsNeeded || []);
    handleShowEditModal();
  };

  const countByStatus = (status) => {
    if (status === "All") {
      return taskPaginationData.total || 0;
    }
    return Array.isArray(tasks)
      ? tasks.filter(
          (item) => item.progress?.toLowerCase() === status.toLowerCase()
        ).length
      : 0;
  };

  const displayedTasks = tasks;
  const totalPages = taskPaginationData.last_page || 1;

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

  useEffect(() => {
    const params = {
      page: currentPage,
      per_page: itemsPerPage,
      ...(selectedStatus !== "All" && { progress: selectedStatus }),
      sortBy: sortBy,
      sortDirection: sortDirection,
    };
    fetchTasks(params);
  }, [currentPage, selectedStatus, sortBy, sortDirection, itemsPerPage]);

  // Update currentPage state when taskPaginationData.current_page changes (after a fetch)
  // This effect is needed to keep the frontend pagination in sync with the backend
  useEffect(() => {
    if (
      taskPaginationData.current_page &&
      taskPaginationData.current_page !== currentPage
    ) {
      setCurrentPage(taskPaginationData.current_page);
    }
  }, [taskPaginationData.current_page]);

  return (
    <div className="rightsidebar">
      <div className="rightsidebar-container">
        <Navbar />
        {/* Render Dashboard content if selected */}
        {selected === "Dashboard" && (
          <div className="rightsidebar-bottom">
            <div className="rightsidebar-navbar">
              <h3>Total Trailer</h3>
              {/* Button to open the Add New Task modal */}
              <div className="rightsidebar-button" onClick={handleShowAddModal}>
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={16}
                  color="#ffffff"
                  strokeWidth={3}
                />
                <p>New Repair</p>
              </div>
            </div>
            <div className="rightsidebar-filter">
              <div className="rightsidebar-filter-button">
                {/* Buttons to switch between table and grid view */}
                <div
                  className={`custom-filter-button ${
                    viewMode === "table" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("table")}
                >
                  <HugeiconsIcon
                    icon={LeftToRightListBulletIcon}
                    size={14}
                    color="#545454"
                  />
                  <p>List</p>
                </div>
                <div
                  className={`custom-filter-button ${
                    viewMode === "grid" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <HugeiconsIcon
                    icon={GridViewIcon}
                    size={14}
                    color="#545454"
                  />
                  <p>Grid</p>
                </div>
              </div>
              <div className="rightsidebar-filter-date">
                {/* Sort by date button (now integrated with sorting logic) */}
                <div
                  className="custom-filter-button filter-date"
                  onClick={() => handleSortClick("created_at")} // Example: Sort by dateIn
                >
                  <HugeiconsIcon
                    icon={Calendar02Icon}
                    size={14}
                    color="#545454"
                  />
                  <p>
                    Sort by Date In{" "}
                    {sortBy === "dateIn" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </p>
                </div>
              </div>
            </div>

            <div className="custom-line no-margin"></div>

            {/* Progress status filters */}
            <div className="rightsidebar-filter-progress">
              {statuses.map((status) => (
                <div
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  style={{ cursor: "pointer" }}
                >
                  <ProgressFilter
                    title={status}
                    count={countByStatus(status)} // Get the count for each status
                    bgColor={selectedStatus === status ? "#333" : "#f1f1f1"}
                    color={selectedStatus === status ? "#fff" : "#000"}
                  />
                </div>
              ))}
            </div>

            {/* Display loading, error, or task data */}
            <div className="rightsidebar-table">
              {loading ? (
                <p>Loading tasks...</p>
              ) : error ? (
                <p>Error: {error.message}</p>
              ) : viewMode === "table" ? (
                <div className="order-table-container">
                  <div className="rightsidebar-table">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          {/* Add onClick to table headers for sorting */}
                          <th
                            onClick={() => handleSortClick("id")}
                            style={{ cursor: "pointer" }}
                          >
                            s/n{" "}
                            {sortBy === "id" &&
                              (sortDirection === "asc" ? "▲" : "▼")}
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
                            onClick={() => handleSortClick("dateIn")}
                            style={{ cursor: "pointer" }}
                          >
                            Date-In{" "}
                            {sortBy === "dateIn" &&
                              (sortDirection === "asc" ? "▲" : "▼")}
                          </th>
                          <th
                            onClick={() => handleSortClick("dateOut")}
                            style={{ cursor: "pointer" }}
                          >
                            Date-Out{" "}
                            {sortBy === "dateOut" &&
                              (sortDirection === "asc" ? "▲" : "▼")}
                          </th>
                          <th
                            onClick={() => handleSortClick("progress")}
                            style={{ cursor: "pointer" }}
                          >
                            Progress{" "}
                            {sortBy === "progress" &&
                              (sortDirection === "asc" ? "▲" : "▼")}
                          </th>
                          <th>Repair Needed</th>{" "}
                          <th>Parts Needed</th>{" "}
                          <th
                            onClick={() => handleSortClick("priority")}
                            style={{ cursor: "pointer" }}
                          >
                            Priority{" "}
                            {sortBy === "priority" &&
                              (sortDirection === "asc" ? "▲" : "▼")}
                          </th>
                          {/*<th>Actions</th>*/}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Use displayedTasks (which is taskPaginationData.data) */}
                        {Array.isArray(displayedTasks) &&
                        displayedTasks.length === 0 ? (
                          <tr>
                            <td colSpan="8">No data available</td>
                          </tr>
                        ) : (
                          Array.isArray(displayedTasks) &&
                          displayedTasks.map((item) => {
                            const { color, bgColor, icon } = getPriorityStyles(
                              item.priority
                            );
                            return (
                              <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.customerName}</td>
                                <td>{item.dateIn}</td>
                                <td>{item.dateOut}</td>
                                <td>{item.progress}</td>
                                <td>
                                  {Array.isArray(item.repairNeeded)
                                    ? item.repairNeeded.join(", ")
                                    : item.repairNeeded}
                                </td>
                                <td>
                                  {Array.isArray(item.partsNeeded)
                                    ? item.partsNeeded
                                        .map(
                                          (part) =>
                                            `${part.name} (${part.quantity})`
                                        )
                                        .join(", ")
                                    : item.partsNeeded}
                                </td>
                                <td>
                                  <Priority
                                    color={color}
                                    bgColor={bgColor}
                                    icon={icon}
                                    title={item.priority}
                                  />
                                </td>
                                {/*<td>
                                {" "}
                                <button
                                  className="btn-info"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    handleShowInfoModal();
                                  }}
                                >
                                  View
                                </button>

                                <button
                                  className="edit-btn"
                                  onClick={() => handleEditClick(item)}

                                >
                                  Edit
                                </button>
                                <button
                                  className="btn-danger"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Delete
                                </button>
                              </td>*/}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                    {/* Pagination for table view */}
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
                        {/* Render pagination items based on totalPages from backend */}
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
                  </div>
                </div>
              ) : (
                <div className="order-table-container">
                <div className="gridview-container">
                  {/* Use displayedTasks (which is taskPaginationData.data) */}
                  {Array.isArray(displayedTasks) &&
                  displayedTasks.length === 0 ? (
                    <div className="no-data-message">
                      <p>No data available.</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid-view">
                        {Array.isArray(displayedTasks) &&
                          displayedTasks.map((item) => {
                            const { color, bgColor, icon } = getPriorityStyles(
                              item.priority
                            );
                            return (
                              <div
                                key={item.id}
                                className="custom-grid"
                                onClick={() => {
                                  setSelectedItem(item);
                                  handleShowInfoModal();
                                }}
                              >
                                <div className="custom-grid-top-container">
                                  <Priority
                                    color={color}
                                    bgColor={bgColor}
                                    icon={icon}
                                    title={item.priority}
                                  />
                                  <div className="custom-grid-edit">
                                    {/* Edit icon in grid view */}
                                    <HugeiconsIcon
                                      icon={MoreHorizontalIcon}
                                      size={20}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(item);
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="custom-grid-bottom-container">
                                  <h3>{item.customerName}</h3>
                                  <p>
                                    Repairs:{" "}
                                    {Array.isArray(item.repairNeeded)
                                      ? item.repairNeeded.join(", ")
                                      : item.repairNeeded}
                                  </p>
                                  <p>
                                    Parts:{" "}
                                    {Array.isArray(item.partsNeeded)
                                      ? item.partsNeeded.join(", ")
                                      : item.partsNeeded}
                                  </p>
                                  <div className="custom-line"></div>
                                  <div className="custom-grid-bottom-date">
                                    <p>{item.dateIn}</p>
                                    <p>{item.progress}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      {/* Pagination for grid view */}
                      <div className="custom-grid-pagination">
                        <Pagination>
                          <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                          />
                          <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          />
                          {/* Render pagination items based on totalPages from backend */}
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
                    </>
                  )}
                </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render Order content if selected */}
        {selected === "Order" && (
          <div className="rightsidebar-bottom">
            {/* Assuming the Order component handles its own data fetching and display */}
            <Order />
          </div>
        )}
      </div>

      {/* Add New Task Modal */}
      <Modal
        show={showAddModal}
        onHide={handleCloseAddModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form">
            <div className="form-group">
              <label htmlFor="customerName">Customer Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                className="input-field"
                value={formData.customerName}
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
                value={formData.dateIn}
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
                value={formData.dateOut}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="progress">Status</label>
              <select
                id="progress"
                name="progress"
                className="input-field"
                value={formData.progress}
                onChange={handleChange}
              >
                <option>New</option>
                <option>In progress</option>
                <option>Repair done</option>
                <option>Called</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="form-group">
              {/* RepairSelector component */}
              <RepairSelector
                selectedRepairs={repairs}
                setSelectedRepairs={setRepairs}
              />
              <p>Selected Repairs: {repairs.join(", ")}</p>
            </div>
            <div className="form-group">
              {/* PartSelector component */}
              <PartSelector selectedParts={parts} setSelectedParts={setParts} />
              <p>Selected Parts: {parts.join(", ")}</p>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="input-field"
                value={formData.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="comments">Comments</label>
              <textarea
                id="comments"
                name="comments"
                className="input-field textarea"
                value={formData.comments}
                onChange={handleChange}
              />
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

      {/* Task Info Modal */}
      <Modal
        show={showInfoModal}
        onHide={handleCloseInfoModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && ( // Render only if selectedItem is not null
            <>
              <div className="info-group">
                <strong>Customer Name:</strong>
                <p>{selectedItem.customerName}</p>
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
                <strong>Status:</strong>
                <p>{selectedItem.progress}</p>
              </div>
              <div className="info-group">
                <strong>Repairs Needed:</strong>
                <p>
                  {Array.isArray(selectedItem.repairNeeded)
                    ? selectedItem.repairNeeded.join(", ")
                    : selectedItem.repairNeeded}
                </p>
              </div>
              <div className="info-group">
                <strong>Parts Needed:</strong>
                <p>
                  {Array.isArray(selectedItem.partsNeeded)
                    ? selectedItem.partsNeeded.join(", ")
                    : selectedItem.partsNeeded}
                </p>
              </div>
              <div className="info-group">
                <strong>Priority:</strong>
                <p>{selectedItem.priority}</p>
              </div>
              {selectedItem.comments && (
                <div className="info-group">
                  <strong>Comments:</strong>
                  <p>{selectedItem.comments}</p>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-secondary" onClick={handleCloseInfoModal}>
            Cancel
          </button>
          {/* Delete button */}
          <button
            className="btn-danger"
            onClick={() => handleDelete(selectedItem.id)}
          >
            Delete
          </button>
          {/* Edit button */}
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

      {/* Edit Task Modal */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="custom-form">
            <div className="form-group">
              <label htmlFor="editCustomerName">Customer Name</label>
              <input
                type="text"
                id="editCustomerName"
                name="customerName"
                className="input-field"
                value={formData.customerName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="editDateIn">Date In</label>
              <input
                type="date"
                id="editDateIn"
                name="dateIn"
                className="input-field"
                value={formData.dateIn}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="editDateOut">Date Out</label>
              <input
                type="date"
                id="editDateOut"
                name="dateOut"
                className="input-field"
                value={formData.dateOut}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="editProgress">Status</label>
              <select
                id="editProgress"
                name="progress"
                className="input-field"
                value={formData.progress}
                onChange={handleChange}
              >
                <option>New</option>
                <option>In progress</option>
                <option>Repair done</option>
                <option>Called</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="form-group">
              {/* RepairSelector component for editing */}
              <RepairSelector
                selectedRepairs={repairs}
                setSelectedRepairs={setRepairs}
              />
              <p>Selected Repairs: {repairs.join(" ")}</p>
            </div>
            <div className="form-group">
              {/* PartSelector component for editing */}
              <PartSelector selectedParts={parts} setSelectedParts={setParts} />
              <p>Selected Parts: {parts.join(" ")}</p>
            </div>
            <div className="form-group">
              <label htmlFor="editPriority">Priority</label>
              <select
                id="editPriority"
                name="priority"
                className="input-field"
                value={formData.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="editComments">Comments</label>
              <textarea
                id="editComments"
                name="comments"
                className="input-field textarea"
                value={formData.comments}
                onChange={handleChange}
              />
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
    </div>
  );
};

export default RightSideBar;
