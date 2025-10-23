import { get } from "http";
import { useEffect, useMemo, useState } from "react";
import "../css/Dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { fetchOrders, OrderListItem } from "../services/orderService";
import { useNavigate } from "react-router-dom";
import { getOrderStatus } from "../utils/orderStatus";

interface MonthlySales {
  month: number;
  ordersCount: number;
  salesTotal: number;
}
const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [salesData, setSalesData] = useState<MonthlySales[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      // setIsLoading(true);
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
          // setIsLoading(false);
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
    return `Showing 1-${Math.min(10, orders.length)} of ${
      orders.length
    } orders`;
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

  const fetchSalesData = async (year: number) => {
    setIsLoading(true);
    try {
      // tạo dữ liệu giả cho mỗi năm (thay đổi chút để nhìn khác nhau)
      let mockData: MonthlySales[] = [];

      if (year === 2023) {
        mockData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          ordersCount: 80 + i * 2,
          salesTotal: 30000000 + i * 2500000,
        }));
      } else if (year === 2024) {
        mockData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          ordersCount: 100 + i * 3,
          salesTotal: 40000000 + i * 2800000,
        }));
      } else if (year === 2025) {
        mockData = [
          { month: 1, ordersCount: 120, salesTotal: 52000000 },
          { month: 2, ordersCount: 95, salesTotal: 41000000 },
          { month: 3, ordersCount: 150, salesTotal: 68000000 },
          { month: 4, ordersCount: 80, salesTotal: 33000000 },
          { month: 5, ordersCount: 140, salesTotal: 61000000 },
          { month: 6, ordersCount: 175, salesTotal: 72000000 },
          { month: 7, ordersCount: 130, salesTotal: 57000000 },
          { month: 8, ordersCount: 160, salesTotal: 75000000 },
          { month: 9, ordersCount: 115, salesTotal: 49000000 },
          { month: 10, ordersCount: 180, salesTotal: 80000000 },
          { month: 11, ordersCount: 105, salesTotal: 42000000 },
          { month: 12, ordersCount: 155, salesTotal: 69000000 },
        ];
      } else if (year === 2026) {
        mockData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          ordersCount: 150 + i * 4,
          salesTotal: 60000000 + i * 3000000,
        }));
      }

      setSalesData(mockData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedYear);
  }, [selectedYear]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  };

  return (
    <div>
      <div className="dashboard-today">
        <div className="dashboard-card">
          <span>Tổng đơn hôm nay</span>
          <span>0</span>
        </div>

        <div className="dashboard-card">
          <span>Doanh thu hôm nay</span>
          <span>0</span>
        </div>

        <div className="dashboard-card">
          <span>Số đơn hủy</span>
          <span>0</span>
        </div>
      </div>

      <div className="dashboard-lists">
        {/* HÀNG 2: Đơn hàng mới chờ xử lý */}
        <div className="order-section">
          <h3 className="order-title">Đơn hàng mới chờ xử lý</h3>
          <div className="order-table">
            <div className="order-header">
              <span>Mã đơn hàng</span>
              <span>Khách hàng</span>
              <span>Ngày đặt</span>
              <span>Giá đơn</span>
              <span>Trạng thái</span>
              <span>Chi tiết</span>
            </div>

            <div className="order-body scrollable">
              {orders
                .filter((order) => order.status === "payment")
                .map((order) => (
                  <div key={order.id} className="order-row">
                    <span>#{order.id}</span>
                    <span>{order.customer}</span>
                    <span>{formatDate(order.date)}</span>
                    <span>
                      {formatCurrency(order.payPrice)} ({order.products}{" "}
                      {order.products > 1 ? "Products" : "Product"})
                    </span>
                    {(() => {
                      const { text, className } = getOrderStatus(order.status);
                      return <span className="status">{text}</span>;
                    })()}
                    <button
                      type="button"
                     className="detail"
                      onClick={() => handleViewDetail(order)}
                    >
                      Chi tiết →
                    </button>
                    {/* <span className="detail">Chi tiết →</span> */}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* HÀNG 1: Hai bảng song song */}
        <div className="product-row">
          {/* Kẹp tóc thường */}
          <div className="list-card">
            <div className="list-header">
              <span>Top sản phẩm kẹp tóc thường bán chạy</span>
            </div>
            <div className="list-content scrollable">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="list-item">
                  <span>Kẹp tóc #{i + 1}</span>
                  <span>{120 - i * 3} đơn</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blindbox */}
          <div className="list-card">
            <div className="list-header">
              <span>Top Blindbox bán chạy</span>
            </div>
            <div className="list-content scrollable">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="list-item">
                  <span>Blindbox #{i + 1}</span>
                  <span>{90 - i * 2} đơn</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-month">
        <div className="month-card">
          <div className="month-row">
            <span>Tổng đơn tháng này</span>
            <span>0</span>
          </div>
          <div className="month-row">
            <span>Tổng đơn tháng trước</span>
            <span>0</span>
          </div>
          <span className="change up">Tăng 10% so với tháng trước</span>
        </div>

        <div className="month-card">
          <div className="month-row">
            <span>Doanh thu tháng này</span>
            <span>0</span>
          </div>
          <div className="month-row">
            <span>Doanh thu tháng trước</span>
            <span>0</span>
          </div>
          <span className="change up">Tăng 10% so với tháng trước</span>
        </div>

        <div className="month-card">
          <div className="month-row">
            <span>Số đơn hủy tháng này</span>
            <span>0</span>
          </div>
          <div className="month-row">
            <span>Số đơn hủy tháng trước</span>
            <span>0</span>
          </div>
          <span className="change down">Giảm 5% so với tháng trước</span>
        </div>
      </div>

      <div className="sales-chart-container">
        <div className="sales-chart-header">
          <span>Biểu đồ doanh thu từng tháng năm</span>
          <select value={selectedYear} onChange={handleYearChange}>
            {[2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                Năm {year}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="loading">Đang tải dữ liệu...</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 40, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffd6e9" />
              <XAxis
                dataKey="month"
                tickFormatter={(m) => `T${m}`}
                stroke="#173da2"
              />
              <YAxis
                yAxisId="left"
                stroke="#173da2"
                tickFormatter={(v) =>
                  `${v.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}`
                }
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#0db67d"
                tickFormatter={(v) =>
                  `${v.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}`
                }
              />

              <Tooltip
                formatter={(
                  value: string | number | (string | number)[],
                  name
                ) => {
                  if (Array.isArray(value)) value = value[0];
                  const formatted =
                    typeof value === "number"
                      ? value.toLocaleString("vi-VN")
                      : value;
                  return name === "Doanh thu"
                    ? [`${formatted} VND`, name]
                    : [`${formatted} đơn`, name];
                }}
                labelFormatter={(m) => `Tháng ${m}`}
              />

              {/* Biểu đồ doanh thu */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="salesTotal"
                name="Doanh thu"
                stroke="#ff66a3"
                strokeWidth={3}
                dot={{ fill: "#ff66a3", r: 4 }}
                activeDot={{ r: 6 }}
              />

              {/* Biểu đồ số lượng đơn */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ordersCount"
                name="Số đơn hàng"
                stroke="#0db67d"
                strokeWidth={2}
                dot={{ fill: "#0db67d", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
