import { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import "../order/order.css";
import "./timecard.css";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download04FreeIcons,
  CalendarAdd02FreeIcons,
  Coffee02FreeIcons,
} from "@hugeicons/core-free-icons";
import ProgressFilter from "../../components/progressfilter/ProgressFilter";
import Pagination from "react-bootstrap/Pagination";
import { useTimeCards } from "../../context/TimeCardContext";
import { useAuth } from "../../context/AuthContext";

const getStatusStyles = (status) => {
  switch (status) {
    case "All":
      return { color: "#FFA500", bgColor: "#FFF5E6" };
    case "Active":
      return { color: "#007BFF", bgColor: "#E6F0FF" };
    case "Vacation":
      return { color: "#17A2B8", bgColor: "#E0F7FA" };
    case "Holiday":
      return { color: "#28a745", bgColor: "#E8F6EA" };
    case "Inactive":
      return { color: "#20c997", bgColor: "#E6FFFA" };
    case "Sick leave":
      return { color: "#6c757d", bgColor: "#f8f9fa" };
    default:
      return { color: "#6c757d", bgColor: "#f8f9fa" };
  }
};

const TimeCard = () => {
  const {
    timeCardPaginationData,
    timeCards,
    currentActiveTimeCard,
    loading,
    error,
    statusCounts,
    users,
    fetchTimeCards,
    updateTimeCard,
    deleteTimeCard,
    fetchStatusCounts,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    addLeaveStatus,
    exportTimeCards,
  } = useTimeCards();

  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(
    timeCardPaginationData.current_page || 1
  );
  const itemsPerPage = timeCardPaginationData.per_page || 50;

  // New state for date filter, defaulting to today
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [selectedStatus, setSelectedStatus] = useState("All"); // Keep for admin filter
  const statuses = [
    "All",
    "Active",
    "Inactive",
    "Vacation",
    "Holiday",
    "Sick leave",
  ];

  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [timeCardToDelete, setTimeCardToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  // New state for clock-out confirmation modal
  const [showClockOutConfirmModal, setShowClockOutConfirmModal] =
    useState(false);

  const [workingHoursDisplay, setWorkingHoursDisplay] = useState("--:--");
  const [breakDurationDisplay, setBreakDurationDisplay] = useState("--:--");
  const [overtimeDisplay, setOvertimeDisplay] = useState("--:--");

  const [timeCardFormData, setTimeCardFormData] = useState({
    user_id: user?.id || null,
    clock_in: null,
    clock_out: null,
    status: "Inactive",
  });

  const [editingTimeCard, setEditingTimeCard] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    user_id: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [exportFilters, setExportFilters] = useState({
    start_date: "",
    end_date: "",
    user_id: "",
    status: "All",
  });

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTimeCard(null);
    resetTimeCardFormData();
  };
  const handleShowEditModal = () => setShowEditModal(true);

  const handleShowLeaveModal = () => {
    setShowLeaveModal(true);
    setLeaveFormData({
      user_id: "",
      leave_type: "",
      start_date: "",
      end_date: "",
      reason: "",
    });
  };
  const handleCloseLeaveModal = () => setShowLeaveModal(false);

  const resetTimeCardFormData = () => {
    setTimeCardFormData({
      user_id: user?.id || null,
      clock_in: null,
      clock_out: null,
      status: "Inactive",
    });
  };

  const handleDateFilterChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterClick = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTimeCardFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExportFilterChange = (e) => {
    const { name, value } = e.target;
    setExportFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLeaveSubmit = async () => {
    if (!leaveFormData.user_id) {
      alert("Please select a user.");
      return;
    }
    const success = await addLeaveStatus(leaveFormData);
    if (success) {
      handleCloseLeaveModal();
    }
  };

  const handleEditClick = (timeCard) => {
    setEditingTimeCard(timeCard);
    setTimeCardFormData({
      user_id: timeCard.user_id,
      clock_in: timeCard.clock_in
        ? new Date(timeCard.clock_in).toISOString().slice(0, 16)
        : null,
      clock_out: timeCard.clock_out
        ? new Date(timeCard.clock_out).toISOString().slice(0, 16)
        : null,
      status: timeCard.status || "Inactive",
    });
    handleShowEditModal();
  };

  const handleEditSubmit = async () => {
    if (!editingTimeCard) return;

    const success = await updateTimeCard(editingTimeCard.id, timeCardFormData);
    if (success) {
      handleCloseEditModal();
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteTimeCard(id);
    if (success) {
      console.log(`Time card with ID ${id} deleted successfully.`);
    }
  };

  const displayedTimeCards = timeCards;
  const totalPages = timeCardPaginationData.last_page || 1;

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

  const fetchTimeCardsCallback = useCallback(() => {
    const params = {
      page: currentPage,
      perPage: itemsPerPage,
      date: selectedDate,
      ...(selectedStatus !== "All" && { status: selectedStatus }),
      sortBy: sortBy,
      sortDirection: sortDirection,
      ...(searchTerm && { search: searchTerm }),
    };
    fetchTimeCards(params);
  }, [
    currentPage,
    itemsPerPage,
    selectedDate,
    selectedStatus,
    sortBy,
    sortDirection,
    searchTerm,
    fetchTimeCards,
  ]);

  useEffect(() => {
    fetchTimeCardsCallback();
  }, [fetchTimeCardsCallback]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  useEffect(() => {
    if (
      timeCardPaginationData.current_page &&
      timeCardPaginationData.current_page !== currentPage
    ) {
      setCurrentPage(timeCardPaginationData.current_page);
    }
  }, [timeCardPaginationData.current_page]);

  const countByStatus = (status) => {
    return statusCounts[status] || 0;
  };

  const handleDownload = async (type) => {
    await exportTimeCards(type, exportFilters);
    setShowDownloadModal(false);
  };

  const calculateTimeDurations = (timeCard, includeCurrent = false) => {
    const clockIn = timeCard?.clock_in ? new Date(timeCard.clock_in) : null;
    const clockOut = timeCard?.clock_out ? new Date(timeCard.clock_out) : null;
    const breaks = timeCard?.breaks || [];

    let totalWorkingHoursMs = 0;
    let totalBreakDurationMs = 0;
    const targetWorkingHoursMs = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

    breaks.forEach((b) => {
      const breakStart = b.break_start ? new Date(b.break_start) : null;
      let breakEnd = b.break_end ? new Date(b.break_end) : null;

      if (includeCurrent && breakStart && !breakEnd) {
        breakEnd = new Date();
      }

      if (breakStart && breakEnd) {
        totalBreakDurationMs += breakEnd.getTime() - breakStart.getTime();
      }
    });

    let effectiveClockOut = clockOut;
    if (includeCurrent && clockIn && !clockOut) {
      effectiveClockOut = new Date();
    }

    if (clockIn && effectiveClockOut) {
      totalWorkingHoursMs = effectiveClockOut.getTime() - clockIn.getTime();
    }

    const netWorkingHoursMs = totalWorkingHoursMs - totalBreakDurationMs;

    const msToHoursMinutes = (ms) => {
      if (ms < 0 || isNaN(ms)) return "0h 0m";
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    };

    let overtime = "0h 0m";
    if (netWorkingHoursMs > targetWorkingHoursMs) {
      overtime = msToHoursMinutes(netWorkingHoursMs - targetWorkingHoursMs);
    } else if (
      netWorkingHoursMs < targetWorkingHoursMs &&
      !includeCurrent && // Only show undertime if clocked out
      clockIn &&
      clockOut
    ) {
      overtime = `-${msToHoursMinutes(
        targetWorkingHoursMs - netWorkingHoursMs
      )}`;
    }

    return {
      workingHours:
        netWorkingHoursMs > 0 ? msToHoursMinutes(netWorkingHoursMs) : "0h 0m",
      breakDuration:
        totalBreakDurationMs > 0
          ? msToHoursMinutes(totalBreakDurationMs)
          : "0h 0m",
      overtime: overtime,
    };
  };

  useEffect(() => {
    let interval;
    if (
      currentActiveTimeCard &&
      currentActiveTimeCard.clock_in &&
      !currentActiveTimeCard.clock_out
    ) {
      interval = setInterval(() => {
        const { workingHours, breakDuration, overtime } =
          calculateTimeDurations(currentActiveTimeCard, true);
        setWorkingHoursDisplay(workingHours);
        setBreakDurationDisplay(breakDuration);
        setOvertimeDisplay(overtime);
      }, 1000);
    } else if (currentActiveTimeCard) {
      const { workingHours, breakDuration, overtime } = calculateTimeDurations(
        currentActiveTimeCard,
        false
      );
      setWorkingHoursDisplay(workingHours);
      setBreakDurationDisplay(breakDuration);
      setOvertimeDisplay(overtime);
    } else {
      setWorkingHoursDisplay("--:--");
      setBreakDurationDisplay("--:--");
      setOvertimeDisplay("--:--");
    }

    return () => clearInterval(interval);
  }, [currentActiveTimeCard]);

  const hasClockedInToday = !!currentActiveTimeCard?.clock_in;
  const hasClockedOutToday = !!currentActiveTimeCard?.clock_out;
  const isClockedIn = hasClockedInToday;
  const isOnBreak =
    currentActiveTimeCard?.breaks?.some((b) => !b.break_end) || false;
  const clockInButtonDisabled = hasClockedInToday;
  const clockOutButtonDisabled = hasClockedOutToday || isOnBreak;
  const startBreakButtonDisabled =
    !isClockedIn || isOnBreak || hasClockedOutToday;
  const endBreakButtonDisabled = !isOnBreak;
  const clockButtonText = isClockedIn ? "Clock Out" : "Clock In";
  const breakButtonText = isOnBreak ? "Stop Break" : "Start Break";

  const clockButtonStyle = {
    backgroundColor: isClockedIn ? "red" : "green",
    color: "#ffffff",
    padding: "8px 15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    border: 'none',
    cursor:
      (clockInButtonDisabled && !isClockedIn) || clockOutButtonDisabled
        ? "not-allowed"
        : "pointer",
    opacity:
      (clockInButtonDisabled && !isClockedIn) || clockOutButtonDisabled
        ? 0.6
        : 1,
    transition: "background-color 0.3s ease",
  };

  const breakButtonStyle = {
    backgroundColor: isOnBreak ? "#dc3545" : "#3c58ae",
    color: "#ffffff",
    padding: "8px 15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    border: 'none',
    cursor:
      (startBreakButtonDisabled && !isOnBreak) ||
      (endBreakButtonDisabled && isOnBreak)
        ? "not-allowed"
        : "pointer",
    opacity:
      (startBreakButtonDisabled && !isOnBreak) ||
      (endBreakButtonDisabled && isOnBreak)
        ? 0.6
        : 1,
    transition: "background-color 0.3s ease",
  };

  // Function to handle clock out button click
  const handleClockOutClick = () => {
    if (isClockedIn) {
      setShowClockOutConfirmModal(true);
    } else {
      clockIn();
    }
  };

  // Function to confirm clock out
  const confirmClockOut = async () => {
    await clockOut();
    setShowClockOutConfirmModal(false);
  };

  return (
    <div className="order-page">
      <div className="rightsidebar-navbar">
        <h3>Time Cards</h3>
        <div className="timesheet-container">
          <button
            className="timesheet-button break-btn"
            onClick={isOnBreak ? endBreak : startBreak}
            style={breakButtonStyle}
            disabled={
              isOnBreak ? endBreakButtonDisabled : startBreakButtonDisabled
            }
            aria-disabled={
              isOnBreak ? endBreakButtonDisabled : startBreakButtonDisabled
            }
          >
            <HugeiconsIcon
              icon={Coffee02FreeIcons}
              size={15}
              color="#ffffff"
              strokeWidth={1.5}
            />
            <p className="text-white"> {breakButtonText} </p>
          </button>
          <button
            className="timesheet-button"
            onClick={handleClockOutClick}
            style={clockButtonStyle}
            disabled={
              isClockedIn ? clockOutButtonDisabled : clockInButtonDisabled
            }
            aria-disabled={
              isClockedIn ? clockOutButtonDisabled : clockInButtonDisabled
            }
          >
            <HugeiconsIcon
              icon={CalendarAdd02FreeIcons}
              size={15}
              color="#ffffff"
              strokeWidth={1.5}
            />
            <p> {clockButtonText} </p>
          </button>
        </div>
      </div>
      {user?.name === "admin" && (
        <div>
          <div className="order-page-title">
            <h3> Date filter </h3>
          </div>

          <div className="download-container">
            <div className="search-input-container select-container">
              <label htmlFor="date-filter">Date:</label>
              <input
                type="date"
                id="date-filter"
                value={selectedDate}
                onChange={handleDateFilterChange}
                className="search-input"
              />
            </div>
            {user?.name === "admin" && (
              <div className="d-flex flex-row row-gap gap-2">
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
                <div
                  className="rightsidebar-button"
                  style={{ backgroundColor: "#28a745" }}
                  onClick={handleShowLeaveModal}
                >
                  <HugeiconsIcon
                    icon={CalendarAdd02FreeIcons}
                    size={16}
                    color="#ffffff"
                    strokeWidth={2}
                  />
                  <p>Add Leave/Holiday</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="timesheet-timer-container">
        <div className="timesheet-timer">
          <p>Clock In</p>
          <h1>
            {currentActiveTimeCard?.clock_in
              ? new Date(currentActiveTimeCard.clock_in).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )
              : "--:--"}
          </h1>
        </div>
        <div className="timesheet-timer">
          <p>Breaks </p>
          <h1>{breakDurationDisplay}</h1>
        </div>
        <div className="timesheet-timer">
          <p>Working hours</p>
          <h1>{workingHoursDisplay}</h1>
        </div>
        <div className="timesheet-timer">
          <p>Overtime</p>
          <h1>{overtimeDisplay}</h1>
        </div>
        <div className="timesheet-timer">
          <p>Clock Out</p>
          <h1>
            {currentActiveTimeCard?.clock_out
              ? new Date(currentActiveTimeCard.clock_out).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit" }
                )
              : "--:--"}
          </h1>
        </div>
      </div>
      <div className="custom-line no-margin"></div>

      {user?.name === "admin" && (
        <div className="rightsidebar-filter-progress">
          {statuses.map((status) => (
            <div
              key={status}
              onClick={() => handleStatusFilterClick(status)}
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
      )}

      {user?.name === "admin" &&
        (loading ? (
          <p>Loading time cards...</p>
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
                    onClick={() => handleSortClick("user_id")}
                    style={{ cursor: "pointer" }}
                  >
                    Name{" "}
                    {sortBy === "user_id" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSortClick("created_at")}
                    style={{ cursor: "pointer" }}
                  >
                    Date{" "}
                    {sortBy === "created_at" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th>Clock In</th>
                  <th>Breaks</th>
                  <th>Working Hours</th>
                  <th>Overtime</th> {/* New table header */}
                  <th>Clock Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTimeCards.map((timeCard) => (
                  <tr key={timeCard.id}>
                    <td>{timeCard.id}</td>
                    <td>{timeCard.user?.name || "N/A"}</td>
                    <td>
                      {new Date(timeCard.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {timeCard.clock_in
                        ? new Date(timeCard.clock_in).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </td>
                    <td>{timeCard.total_break_duration || "0h 0m"}</td>
                    <td>{timeCard.working_hours || "0h 0m"}</td>
                    <td>{timeCard.overtime || "0h 0m"}</td>{" "}
                    {/* Display overtime */}
                    <td>
                      {timeCard.clock_out
                        ? new Date(timeCard.clock_out).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className="order-status"
                        style={{
                          backgroundColor: getStatusStyles(timeCard.status)
                            .bgColor,
                          color: getStatusStyles(timeCard.status).color,
                        }}
                      >
                        {timeCard.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="edit-button btn btn-outline-primary btn-sm"
                        onClick={() => handleEditClick(timeCard)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {user?.name === "admin" && (
        <div className="pagination-container">
          <Pagination>
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
          </Pagination>
        </div>
      )}

      {user?.name === "admin" && editingTimeCard && (
        <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
          <Modal.Header closeButton>
            <Modal.Title> Edit Time Card</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label>Clock In:</label>
              <input
                type="datetime-local"
                className="form-control"
                name="clock_in"
                value={timeCardFormData.clock_in || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Clock Out:</label>
              <input
                type="datetime-local"
                className="form-control"
                name="clock_out"
                value={timeCardFormData.clock_out || ""}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                className="form-control"
                name="status"
                value={timeCardFormData.status}
                onChange={handleChange}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {user?.name === "admin" && (
        <Modal show={showLeaveModal} onHide={handleCloseLeaveModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Add Leave/Holiday</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label>User:</label>
              <select
                className="form-control"
                name="user_id"
                value={leaveFormData.user_id}
                onChange={handleLeaveChange}
                required
              >
                <option value="">Select a user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Leave Type:</label>
              <select
                className="form-control"
                name="leave_type"
                value={leaveFormData.leave_type}
                onChange={handleLeaveChange}
                required
              >
                <option value="">Select Leave Type</option>
                <option value="Vacation">Vacation</option>
                <option value="Holiday">Holiday</option>
                <option value="Sick leave">Sick leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                className="form-control"
                name="start_date"
                value={leaveFormData.start_date}
                onChange={handleLeaveChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                className="form-control"
                name="end_date"
                value={leaveFormData.end_date}
                onChange={handleLeaveChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Reason:</label>
              <textarea
                className="form-control"
                name="reason"
                rows="3"
                value={leaveFormData.reason}
                onChange={handleLeaveChange}
                maxLength="500"
              ></textarea>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseLeaveModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAddLeaveSubmit}>
              Submit Leave
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {user?.name === "admin" && (
        <Modal
          show={showDeleteConfirmModal}
          onHide={() => setShowDeleteConfirmModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this time card record for{" "}
            <strong>{timeCardToDelete?.user?.name}</strong> on{" "}
            <strong>
              {timeCardToDelete?.created_at
                ? new Date(timeCardToDelete.created_at).toLocaleDateString()
                : "N/A"}
            </strong>
            ?
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirmModal(false)}
            >
              Cancel
            </Button>
            <button
              className="delete-btn"
              onClick={() => {
                handleDelete(timeCardToDelete.id);
                setShowDeleteConfirmModal(false);
              }}
            >
              Confirm Delete
            </button>
          </Modal.Footer>
        </Modal>
      )}

      {user?.name === "admin" && (
        <Modal
          show={showDownloadModal}
          onHide={() => setShowDownloadModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Download Data</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <label>Start Date:</label>
              <input
                type="date"
                className="form-control"
                name="start_date"
                value={exportFilters.start_date}
                onChange={handleExportFilterChange}
              />
            </div>
            <div className="form-group">
              <label>End Date:</label>
              <input
                type="date"
                className="form-control"
                name="end_date"
                value={exportFilters.end_date}
                onChange={handleExportFilterChange}
              />
            </div>
            <div className="form-group">
              <label>User:</label>
              <select
                className="form-control"
                name="user_id"
                value={exportFilters.user_id}
                onChange={handleExportFilterChange}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                className="form-control"
                name="status"
                value={exportFilters.status}
                onChange={handleExportFilterChange}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-button-download mt-4">
              <Button
                className="download-button"
                variant="outline-primary"
                onClick={() => handleDownload("pdf")}
              >
                Download PDF
              </Button>
              <Button
                variant="outline-success"
                onClick={() => handleDownload("csv")}
              >
                Download CSV
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
      )}

      {/* Clock Out Confirmation Modal */}
      <Modal
        show={showClockOutConfirmModal}
        onHide={() => setShowClockOutConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Clock Out</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to clock out for today?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowClockOutConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmClockOut}>
            Clock Out
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TimeCard;