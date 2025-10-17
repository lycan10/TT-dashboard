import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { OrderProvider } from "./context/OrderContext";
import Login from "./screens/login/Login";
import Dashboard from "./screens/dashboard/Dashboard";
import OrderPage from "./screens/order/Order";
import Inventory from "./screens/Inventory/Inventory";
import Hitch from "./screens/hitch/Hitch";
import ChangeUsersPassword from "./screens/ChangeUsersPassword/changeUsersPassword";
import { InventoryProvider } from "./context/InventoryContext";
import { HitchProvider } from "./context/HitchContext";
import { TimeCardProvider } from "./context/TimeCardContext";
import { OverviewProvider } from './context/OverviewContext';

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
        <InventoryProvider>
          <HitchProvider>
            <OrderProvider>
              <TimeCardProvider>
                <OverviewProvider>
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
                    <Route
                      path="/inventory"
                      element={<ProtectedRoute element={Inventory} />}
                    />
                    <Route
                      path="/hitch"
                      element={<ProtectedRoute element={Hitch} />}
                    />
                    <Route
                      path="/change-password"
                      element={<ProtectedRoute element={ChangeUsersPassword} />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </OverviewProvider>
              </TimeCardProvider>
            </OrderProvider>
          </HitchProvider>
        </InventoryProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
