import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [taskPaginationData, setTaskPaginationData] = useState({
    current_page: 1,
    data: [],
    first_page_url: null,
    from: null,
    last_page: 1,
    last_page_url: null,
    links: [],
    next_page_url: null,
    path: null,
    per_page: 10, // Adjusted to 10 for consistency as per TaskController
    prev_page_url: null,
    to: null,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskCounts, setTaskCounts] = useState({}); // Added for task counts
  const { token } = useAuth();
  const TASKS_API_URL = `${process.env.REACT_APP_BASE_URL}/api/tasks`;

  const fetchTasks = async (params = {}) => {
    if (!token) {
      setTaskPaginationData({
        current_page: 1,
        data: [],
        first_page_url: null,
        from: null,
        last_page: 1,
        last_page_url: null,
        links: [],
        next_page_url: null,
        path: null,
        per_page: 10, // Adjusted to 10
        prev_page_url: null,
        to: null,
        total: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);

    const query = new URLSearchParams(params).toString();
    try {
      const response = await fetch(`${TASKS_API_URL}?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks");
      }

      const data = await response.json();
      setTaskPaginationData(data);
    } catch (err) {
      setError(err);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskCounts = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/task/counts`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch task counts");
      }
      const data = await response.json();
      setTaskCounts(data);
    } catch (err) {
      console.error("Error fetching task counts:", err);
    }
  };

  const addTask = async (taskData) => {
    if (!token) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(TASKS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add task");
      }

      const newTask = await response.json();
      fetchTasks({
        page: taskPaginationData.current_page,
        perPage: taskPaginationData.per_page,
        ...(taskPaginationData.progress && {
          progress: taskPaginationData.progress,
        }),
      }); // Re-fetch to update pagination data
      fetchTaskCounts(); // Re-fetch counts
      return newTask;
    } catch (err) {
      setError(err);
      console.error("Error adding task:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, taskData) => {
    if (!token) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${TASKS_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task");
      }

      const updatedTask = await response.json();
      fetchTasks({
        page: taskPaginationData.current_page,
        perPage: taskPaginationData.per_page,
        ...(taskPaginationData.progress && {
          progress: taskPaginationData.progress,
        }),
      }); // Re-fetch to update pagination data
      fetchTaskCounts(); // Re-fetch counts
      return updatedTask;
    } catch (err) {
      setError(err);
      console.error("Error updating task:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    if (!token) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${TASKS_API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task");
      }

      // Adjust page if current page becomes empty after deletion
      let newPage = taskPaginationData.current_page;
      if (taskPaginationData.data.length === 1 && newPage > 1) {
        newPage -= 1;
      }

      fetchTasks({
        page: newPage,
        perPage: taskPaginationData.per_page,
        ...(taskPaginationData.progress && {
          progress: taskPaginationData.progress,
        }),
      });
      fetchTaskCounts(); // Re-fetch counts
      return true;
    } catch (err) {
      setError(err);
      console.error("Error deleting task:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // New function for exporting task data
  const exportTasks = async (format, params = {}) => {
    if (!token) {
      setError(new Error("Authentication token not available."));
      return;
    }

    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams(params).toString();
    const exportUrl = `${process.env.REACT_APP_BASE_URL}/api/task/export-${format}?${queryParams}`;

    try {
      const response = await fetch(exportUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      if (!response.ok) {
        let errorMessage = `Failed to export tasks as ${format}. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use the default error message
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks_report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err);
      console.error(`Error exporting tasks as ${format}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTaskCounts();
  }, [token]);

  return (
    <TaskContext.Provider
      value={{
        taskPaginationData,
        tasks: taskPaginationData.data,
        loading,
        error,
        taskCounts, // Provide taskCounts
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        fetchTaskCounts,
        exportTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
