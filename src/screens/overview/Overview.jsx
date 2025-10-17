import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  RefreshIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useOverview } from "../../context/OverviewContext";
import "../order/order.css";
import "../overview/overview.css";
import { useAuth } from "../../context/AuthContext";

const Overview = () => {
  const { 
    taskData, 
    loading, 
    dateRange, 
    updateDateRange,
    fetchTaskData,
    getPresetRanges 
  } = useOverview();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
    const { user } = useAuth();

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleRefresh = () => {
    fetchTaskData();
  };

  const handlePresetSelect = (preset) => {
    const ranges = getPresetRanges();
    const selectedRange = ranges[preset];
    updateDateRange(selectedRange.startDate, selectedRange.endDate);
    setTempDateRange(selectedRange);
    setShowDatePicker(false);
  };

  const handleApplyCustomRange = () => {
    updateDateRange(tempDateRange.startDate, tempDateRange.endDate);
    setShowDatePicker(false);
  };

  const handleCancelDatePicker = () => {
    setTempDateRange(dateRange);
    setShowDatePicker(false);
  };

  // Convert seconds to hours for chart display
  const secondsToHours = (seconds) => {
    return (seconds / 3600).toFixed(1);
  };

  // Custom tooltip for bar charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#2c3e50' }}>{label}</p>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
            Duration: <strong>{data.formatted}</strong>
          </p>
          {data.count && (
            <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
              Tasks: <strong>{data.count}</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Prepare data for charts
  const totalTimeChartData = taskData.analytics.bar_chart_data.map(item => ({
    status: item.status,
    hours: parseFloat(secondsToHours(item.total_time_seconds)),
    formatted: item.total_time_formatted,
    count: item.count
  }));

  const meanTimeChartData = taskData.analytics.bar_chart_data.map(item => ({
    status: item.status,
    hours: parseFloat(secondsToHours(item.mean_time_seconds)),
    formatted: item.mean_time_formatted,
    count: item.count
  }));

  const TaskCard = ({ title, tasks, backgroundColor, foregroundColor, icon }) => (
    <div style={{
      backgroundColor: '#f1f1f1',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #e9ecef',
      minHeight: '350px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <HugeiconsIcon icon={icon} color={foregroundColor} size={20} />
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#2c3e50',
          margin: 0
        }}>
          {title} Turnaround
        </h2>
      </div>
      {tasks && tasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.map((task, index) => (
            <div
              key={task.task_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: backgroundColor,
                borderRadius: '8px',
                border: `1px solid ${foregroundColor}20`,
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: foregroundColor,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    {task.customer_name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#6b7280'
                  }}>
                    {task.priority && `${task.priority} • `}Task #{task.task_id}
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: foregroundColor,
                backgroundColor: `${foregroundColor}15`,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}>
                {task.duration_formatted}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p>No completed tasks in selected period</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="order-page">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="loading-spinner" />
          <p style={{ color: '#6b7280' }}>Loading task analytics...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="order-page">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
          <p style={{ color: '#6b7280' }}>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }
  

  return (
    <div className="order-page">
      <div className="rightsidebar-navbar">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}>
          <h3>Task Analytics Overview</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="date-picker-button"
            >
              <HugeiconsIcon icon={Calendar01Icon} size={16} />
              <span>
                {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
              </span>
            </button>
            
            {showDatePicker && (
              <div className="date-picker-dropdown">
                <div className="preset-ranges">
                  <h4>Quick Select</h4>
                  {Object.keys(getPresetRanges()).map((preset) => (
                    <button
                      key={preset}
                      className="preset-button"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                
                <div className="custom-range">
                  <h4>Custom Range</h4>
                  <input
                    type="date"
                    className="date-input"
                    value={tempDateRange.startDate}
                    onChange={(e) => setTempDateRange({ ...tempDateRange, startDate: e.target.value })}
                    max={tempDateRange.endDate}
                  />
                  <input
                    type="date"
                    className="date-input"
                    value={tempDateRange.endDate}
                    onChange={(e) => setTempDateRange({ ...tempDateRange, endDate: e.target.value })}
                    min={tempDateRange.startDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <div className="date-actions">
                    <button className="btn-secondary" onClick={handleCancelDatePicker}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleApplyCustomRange}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              className="refresh-button"
              title="Refresh Data"
            >
              <HugeiconsIcon icon={RefreshIcon} size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="order-table-container">
        <div className="overview-card-main-container">
          {/* Top 5 Shortest and Longest Tasks */}
          <div className="overview-cable-container">
            <TaskCard
              title="Shortest"
              tasks={taskData.analytics.shortest_turnaround_tasks}
              backgroundColor="rgba(34, 197, 94, 0.08)"
              foregroundColor="#22c55e"
              icon={ArrowDown01Icon}
            />
            <TaskCard
              title="Longest"
              tasks={taskData.analytics.longest_turnaround_tasks}
              backgroundColor="rgba(239, 68, 68, 0.08)"
              foregroundColor="#ef4444"
              icon={ArrowUp01Icon}
            />
          </div>

          {/* Bar Charts */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {/* Total Time Chart */}
            <div className="bar-graph">
              <h2>Total Time</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={totalTimeChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="status" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Duration', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '14px', fontWeight: 600 }
                    }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="hours" 
                    fill="#Ffac1f" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={80}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mean Time Chart */}
            <div className="bar-graph">
              <h2>Mean Time</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={meanTimeChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="status" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Duration', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '14px', fontWeight: 600 }
                    }}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="hours" 
                    fill="#3b82f6" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={80}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;