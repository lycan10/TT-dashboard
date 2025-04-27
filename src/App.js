import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { OrderProvider } from './context/OrderContext';
import Login from './screens/login/Login';
import Dashboard from "./screens/dashboard/Dashboard";
import OrderPage from './screens/order/Order';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>Loading...</p>;
  }
  return user ? <Component {...rest} /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <OrderProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={<ProtectedRoute element={Dashboard} />}
              />
              <Route
                path="/orders"
                element={<ProtectedRoute element={OrderPage} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </OrderProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
