import { useEffect, useMemo, useState } from "react";
import "../css/Order.css";
import { useNavigate } from "react-router-dom";
import { fetchOrders, OrderListItem } from "../services/orderService";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOrders();
        if (isMounted) {
          setOrders(data);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Unable to load orders.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const headingSummary = useMemo(() => {
    if (orders.length === 0) return "No orders available";
    return `Showing 1-${Math.min(10, orders.length)} of ${orders.length} orders`;
  }, [orders]);

  const formatDate = (value: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("vi-VN");
  };

  const formatCurrency = (value: number) =>
    `${value.toLocaleString("vi-VN")} VND`;

  const handleViewDetail = (order: OrderListItem) => {
    navigate(`/OrderDetail/${order.id}`, { state: { order } });
  };

  return (
    <div className="order-container">
      <div className="header-order">
        <h2>Quản lý các đơn đặt hàng</h2>
        <div className="header-order-flex">
          <p>Đơn hàng hiện đang được ghi lại trong hệ thống</p>
          <p>{headingSummary}</p>
        </div>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>MÃ đơn hàng</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Giá đơn</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5} className="order-feedback">
                Loading orders...
              </td>
            </tr>
          )}
          {error && (
            <tr>
              <td colSpan={5} className="order-feedback error">
                {error}
              </td>
            </tr>
          )}
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="order-id">#{order.id}</td>
              <td>{order.customer}</td>
              <td>{formatDate(order.date)}</td>
              <td>
                {formatCurrency(order.payPrice)} ({order.products}{" "}
                {order.products > 1 ? "Products" : "Product"})
              </td>
              <td>{order.status ?? "N/A"}</td>
              <td className="action">
                <button
                  type="button"
                  className="view-details"
                  onClick={() => handleViewDetail(order)}
                >
                  Chi tiết {"->"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
