import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orderPaginationData, setOrderPaginationData] = useState({
    current_page: 1,
    data: [],
    first_page_url: null,
    from: null,
    last_page: 1,
    last_page_url: null,
    links: [],
    next_page_url: null,
    path: null,
    per_page: 10,
    prev_page_url: null,
    to: null,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const ORDERS_API_URL = `${process.env.REACT_APP_BASE_URL}/api/orders`;

  const fetchOrders = useCallback(
    async (params = {}) => {
      if (!token) {
        setOrderPaginationData({
          current_page: 1,
          data: [],
          first_page_url: null,
          from: null,
          last_page: 1,
          last_page_url: null,
          links: [],
          next_page_url: null,
          path: null,
          per_page: 10,
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
          ? `${ORDERS_API_URL}?${queryParams}`
          : ORDERS_API_URL;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch orders");
        }

        const data = await response.json();
        const isSameData =
          JSON.stringify(data) === JSON.stringify(orderPaginationData);
        if (!isSameData) {
          setOrderPaginationData(data);
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching orders:", err);
        setOrderPaginationData({
          current_page: 1,
          data: [],
          first_page_url: null,
          from: null,
          last_page: 1,
          last_page_url: null,
          links: [],
          next_page_url: null,
          path: null,
          per_page: 10,
          prev_page_url: null,
          to: null,
          total: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [token, orderPaginationData.per_page]
  );

  const addOrder = async (order) => {
    if (!token) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(ORDERS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add order");
      }

      const newOrder = await response.json();
      fetchOrders({
        page: orderPaginationData.current_page,
        perPage: orderPaginationData.per_page,
        ...(orderPaginationData.status && {
          status: orderPaginationData.status,
        }),
      });
      return true;
    } catch (err) {
      setError(err);
      console.error("Error adding order:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, updatedOrder) => {
    if (!token) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${ORDERS_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedOrder),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order");
      }

      const result = await response.json();
      fetchOrders({
        page: orderPaginationData.current_page,
        perPage: orderPaginationData.per_page,
        ...(orderPaginationData.status && {
          status: orderPaginationData.status,
        }),
      });
      return true;
    } catch (err) {
      setError(err);
      console.error("Error updating order:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    if (!token) return false;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${ORDERS_API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete order");
      }

      fetchOrders({
        page: orderPaginationData.current_page,
        perPage: orderPaginationData.per_page,
        ...(orderPaginationData.status && {
          status: orderPaginationData.status,
        }),
      });
      return true;
    } catch (err) {
      setError(err);
      console.error("Error deleting order:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return (
    <OrderContext.Provider
      value={{
        orderPaginationData,
        orders: orderPaginationData.data,
        loading,
        error,
        fetchOrders,
        addOrder,
        updateOrder,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
