import { useEffect, useState } from "react";
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
import {
  fetchDailyOrder,
  DailyOrderData,
  MonthlySalesResponse,
} from "../services/dashboardService";
import { fetchTopBlindboxes, TopBlindbox } from "../services/dashboardService";
import { fetchTopProducts, TopProduct } from "../services/dashboardService";
import { fetchYearlySalesSummary } from "../services/dashboardService";
import { fetchMonthlySalesOrder } from "../services/dashboardService";

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
  const [dailyData, setDailyData] = useState<DailyOrderData | null>(null);
  const [topBlindboxes, setTopBlindboxes] = useState<TopBlindbox[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySalesResponse>({
    orderThisMonth: 0,
    orderLastMonth: 0,
    orderFailedThisMonth: 0,
    orderFailedLastMonth: 0,
    thisMonthSales: 0,
    lastMonthSales: 0,
  });

  useEffect(() => {
    const loadMonthlyData = async () => {
      try {
        const data = await fetchMonthlySalesOrder();
        setMonthlyData(data);
      } catch (err) {
        console.error("Không thể tải dữ liệu thống kê tháng:", err);
      }
    };

    loadMonthlyData();

    const loadDailyData = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const data = await fetchDailyOrder(token || "");
        setDailyData(data);
      } catch (err) {
        console.error("Không thể tải dữ liệu thống kê hôm nay:", err);
      }
    };
    loadDailyData();

    // Load top blindboxes
    const loadTopBlindboxes = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const data = await fetchTopBlindboxes(token || "");
        setTopBlindboxes(data);
      } catch (err) {
        console.error("Không thể tải danh sách top blindbox:", err);
      }
    };
    loadTopBlindboxes();

    // Load top products
    const loadTopProducts = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const data = await fetchTopProducts(token || "");
        setTopProducts(data);
      } catch (err) {
        console.error("Không thể tải danh sách top sản phẩm:", err);
      }
    };
    loadTopProducts();

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
      const data = await fetchYearlySalesSummary(year);
      setSalesData(data.monthlySales);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu doanh thu năm:", error);
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

  const calcChange = (current: number, previous: number): string => {
    if (previous === 0) return "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change.toFixed(1)}%`;
  };

  const isIncrease = (current: number, previous: number) => current >= previous;

  return (
    <div>
      <div className="dashboard-today">
        <div className="dashboard-card">
          <span>Tổng đơn hôm nay</span>
          <span>{dailyData?.countOrder}</span>
        </div>

        <div className="dashboard-card">
          <span>Doanh thu hôm nay</span>
          <span>
            {dailyData
              ? dailyData.totalSales.toLocaleString("vi-VN") + " VND"
              : "..."}
          </span>
        </div>

        <div className="dashboard-card">
          <span>Số đơn hủy</span>
          <span>{dailyData?.countOrderCancel}</span>
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
              {(() => {
                const filteredOrders = orders.filter(
                  (order) => order.status === "payment"
                );

                if (filteredOrders.length === 0) {
                  return (
                    <p style={{ textAlign: "center", color: "#999" }}>
                      Không có đơn hàng nào
                    </p>
                  );
                }
                return filteredOrders.map((order) => (
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
                      return (
                        <span className={`status ${className}`}>{text}</span>
                      );
                    })()}
                    <button
                      type="button"
                      className="detail"
                      onClick={() => handleViewDetail(order)}
                    >
                      Chi tiết →
                    </button>
                  </div>
                ));
              })()}
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
              {topProducts.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999" }}>
                  Không có dữ liệu
                </p>
              ) : (
                topProducts.map((product) => (
                  <div key={product.id} className="list-item">
                    <div className="list-item-info">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0].address
                            : "https://via.placeholder.com/60"
                        }
                        alt={product.name}
                        className="list-item-image"
                      />
                      <span className="list-item-name">{product.name}</span>
                    </div>
                    <span className="list-item-quantity">
                      {product.quantitySold} đơn
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Blindbox */}
          <div className="list-card">
            <div className="list-header">
              <span>Top Blindbox bán chạy</span>
            </div>

            <div className="list-content scrollable">
              {topBlindboxes.length === 0 ? (
                <p style={{ textAlign: "center", color: "#999" }}>
                  Không có dữ liệu
                </p>
              ) : (
                topBlindboxes.map((box) => (
                  <div key={box.id} className="list-item">
                    <div className="list-item-info">
                      <img
                        src={
                          box.images && box.images.length > 0
                            ? box.images[0].address
                            : "https://via.placeholder.com/60"
                        }
                        alt={box.name}
                        className="list-item-image"
                      />
                      <span className="list-item-name">{box.name}</span>
                    </div>
                    <span className="list-item-quantity">
                      {box.quantitySold} đơn
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-month">
        <div className="month-card">
          <div className="month-row">
            <span>Tổng đơn tháng này</span>
            <span>{monthlyData.orderThisMonth}</span>
          </div>
          <div className="month-row">
            <span>Tổng đơn tháng trước</span>
            <span>{monthlyData.orderLastMonth}</span>
          </div>
          <span
            className={`change ${
              isIncrease(monthlyData.orderThisMonth, monthlyData.orderLastMonth)
                ? "up"
                : "down"
            }`}
          >
            {isIncrease(monthlyData.orderThisMonth, monthlyData.orderLastMonth)
              ? "Tăng"
              : "Giảm"}{" "}
            {calcChange(monthlyData.orderThisMonth, monthlyData.orderLastMonth)}{" "}
            so với tháng trước
          </span>
        </div>

        <div className="month-card">
          <div className="month-row">
            <span>Doanh thu tháng này</span>
            <span>{monthlyData.thisMonthSales.toLocaleString("vi-VN")}</span>
          </div>
          <div className="month-row">
            <span>Doanh thu tháng trước</span>
            <span>{monthlyData.lastMonthSales.toLocaleString("vi-VN")}</span>
          </div>
          <span
            className={`change ${
              isIncrease(monthlyData.thisMonthSales, monthlyData.lastMonthSales)
                ? "up"
                : "down"
            }`}
          >
            {isIncrease(monthlyData.thisMonthSales, monthlyData.lastMonthSales)
              ? "Tăng"
              : "Giảm"}{" "}
            {calcChange(monthlyData.thisMonthSales, monthlyData.lastMonthSales)}{" "}
            so với tháng trước
          </span>
        </div>

        <div className="month-card">
          <div className="month-row">
            <span>Số đơn hủy tháng này</span>
            <span>{monthlyData.orderFailedThisMonth}</span>
          </div>
          <div className="month-row">
            <span>Số đơn hủy tháng trước</span>
            <span>{monthlyData.orderFailedLastMonth}</span>
          </div>
          <span
            className={`change ${
              isIncrease(
                monthlyData.orderFailedThisMonth,
                monthlyData.orderFailedLastMonth
              )
                ? "up"
                : "down"
            }`}
          >
            {isIncrease(
              monthlyData.orderFailedThisMonth,
              monthlyData.orderFailedLastMonth
            )
              ? "Tăng"
              : "Giảm"}{" "}
            {calcChange(
              monthlyData.orderFailedThisMonth,
              monthlyData.orderFailedLastMonth
            )}{" "}
            so với tháng trước
          </span>
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
