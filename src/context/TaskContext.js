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
    per_page: 12,
    prev_page_url: null,
    to: null,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        per_page: 12,
        prev_page_url: null,
        to: null,
        total: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${TASKS_API_URL}?${queryParams}`
        : TASKS_API_URL;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks");
      }

      const data = await response.json();
      setTaskPaginationData(data);
    } catch (err) {
      setError(err);
      console.error("Error fetching tasks:", err);
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
        per_page: 12,
        prev_page_url: null,
        to: null,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task) => {
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
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add task");
      }

      const newTask = await response.json();
      fetchTasks({
        page: taskPaginationData.current_page,
        per_page: taskPaginationData.per_page,
        ...(taskPaginationData.progress && {
          progress: taskPaginationData.progress,
        }),
      });
      return true;
    } catch (err) {
      setError(err);
      console.error("Error adding task:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, updatedTask) => {
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
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task");
      }

      const result = await response.json();
      fetchTasks({
        page: taskPaginationData.current_page,
        per_page: taskPaginationData.per_page,
        ...(taskPaginationData.progress && {
          progress: taskPaginationData.progress,
        }),
      });
      return true;
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task");
      }

      fetchTasks({
        page: taskPaginationData.current_page,
        per_page: taskPaginationData.per_page,
        ...(taskPaginationData.progress && {
          progress: taskPaginationData.progress,
        }),
      });
      return true;
    } catch (err) {
      setError(err);
      console.error("Error deleting task:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        taskPaginationData,
        tasks: taskPaginationData.data,
        loading,
        error,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
