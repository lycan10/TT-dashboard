import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const OverviewContext = createContext(null);

export const OverviewProvider = ({ children }) => {
  const { token, logout } = useAuth();
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [taskData, setTaskData] = useState({
    counts: {},
    total: 0,
    analytics: {
      shortest_turnaround_tasks: [],
      longest_turnaround_tasks: [],
      bar_chart_data: []
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildQueryParams = useCallback((additionalParams = {}) => {
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      ...additionalParams
    });
    return params.toString();
  }, [dateRange.startDate, dateRange.endDate]);

  const fetchTaskCounts = useCallback(async () => {
    if (!token) return {};

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/task/counts?${buildQueryParams()}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 401) {
        logout();
        return {};
      }

      if (!response.ok) {
        throw new Error("Failed to fetch task counts");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching task counts:", error);
      throw error;
    }
  }, [token, logout, buildQueryParams]);

  const fetchTaskAnalytics = useCallback(async () => {
    if (!token) return {};

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/task/analytics?${buildQueryParams()}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 401) {
        logout();
        return {};
      }

      if (!response.ok) {
        throw new Error("Failed to fetch task analytics");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching task analytics:", error);
      throw error;
    }
  }, [token, logout, buildQueryParams]);

  const fetchTaskData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [countsData, analyticsData] = await Promise.all([
        fetchTaskCounts(),
        fetchTaskAnalytics()
      ]);

      const processedData = {
        counts: countsData || {},
        total: Object.values(countsData || {}).reduce((sum, count) => sum + count, 0) - (countsData?.All || 0),
        analytics: {
          shortest_turnaround_tasks: analyticsData?.shortest_turnaround_tasks || [],
          longest_turnaround_tasks: analyticsData?.longest_turnaround_tasks || [],
          bar_chart_data: analyticsData?.bar_chart_data || [],
          date_range: analyticsData?.date_range || { 
            start_date: dateRange.startDate, 
            end_date: dateRange.endDate 
          }
        }
      };

      setTaskData(processedData);
    } catch (err) {
      console.error("Fetch task data error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, fetchTaskCounts, fetchTaskAnalytics, dateRange]);

  const updateDateRange = useCallback((startDate, endDate) => {
    setDateRange({ startDate, endDate });
  }, []);

  const getPresetRanges = useCallback(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);
    
    const lastQuarter = new Date(today);
    lastQuarter.setDate(lastQuarter.getDate() - 90);

    return {
      'Today': {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      'Yesterday': {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0]
      },
      'Last 7 Days': {
        startDate: lastWeek.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      'Last 30 Days': {
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      },
      'Last 90 Days': {
        startDate: lastQuarter.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    };
  }, []);

  useEffect(() => {
    fetchTaskData();
  }, [fetchTaskData]);

  return (
    <OverviewContext.Provider
      value={{
        taskData,
        loading,
        error,
        dateRange,
        fetchTaskData,
        updateDateRange,
        getPresetRanges
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
};

export const useOverview = () => useContext(OverviewContext);