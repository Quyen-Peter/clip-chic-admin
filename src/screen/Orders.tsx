import { useEffect, useState } from "react";
import "../css/Order.css";

interface Order {
  id: string;
  customer: string;
  date: string;
  total: string;
  products: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/orders.json")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="order-container">
      <div className="header-order">
        <h2>Quản lý đơn đặt hàng</h2>
        <div className="header-order-flex">
          <p>Danh sách đơn hàng trong hệ thống</p>
          <p>Showing 1–10 of {orders.length} orders</p>
        </div>
      </div>

      <table className="order-table">
        <thead>
          <tr>
            <th>ORDER ID</th>
            <th>CUSTOMERS</th>
            <th>DATE</th>
            <th>TOTAL</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="order-id">#{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>
                {order.total} ({order.products}{" "}
                {order.products > 1 ? "Products" : "Product"})
              </td>
              <td className="action">
                <a href={`/orders/${order.id}`} className="view-details">
                  View Details →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default Orders;
