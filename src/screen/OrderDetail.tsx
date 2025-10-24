import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../css/OrderDetail.css";
import OrderSteps from "../component/OrderSteps";
import {
  fetchOrderById,
  OrderDetailData,
  updateOrderStatus,
} from "../services/orderService";

const STATUS_OPTIONS = [
  { value: "payment", label: "Đang chờ xử lý" },
  { value: "processing", label: "Đã xác nhận (đang chờ vận chuyển)" },
  { value: "shipping", label: "Đang giao hàng" },
  { value: "delivered", label: "Giao hàng thành công" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "refunded", label: "Đã hoàn tiền" },
  { value: "returned", label: "Đã trả hàng" },
  { value: "failed", label: "Thanh toán thất bại" },
];


const formatCurrency = (value?: number | null) => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) {
    return "0 VND";
  }
  return `${numeric.toLocaleString("vi-VN")} VND`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString("vi-VN");
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialOrder = location.state?.order as OrderDetailData | undefined;

  const [order, setOrder] = React.useState<OrderDetailData | null>(
    initialOrder ?? null
  );
  const [status, setStatus] = React.useState(initialOrder?.status ?? "");
  const [isLoading, setIsLoading] = React.useState(!initialOrder);
  const [error, setError] = React.useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [updateFeedback, setUpdateFeedback] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    if (!order && id) {
      let isMounted = true;
      const orderId = Number(id);
      if (Number.isNaN(orderId)) {
        setError("Order id is invalid.");
        setIsLoading(false);
        return;
      }

      fetchOrderById(orderId)
        .then((data) => {
          if (isMounted) {
            setOrder(data);
            setStatus(data.status ?? "");
          }
        })
        .catch((err) => {
          if (isMounted) {
            const message =
              err instanceof Error ? err.message : "Unable to load order.";
            setError(message);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    } else if (initialOrder) {
      setStatus(initialOrder.status ?? "");
    }
  }, [id, order, initialOrder]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    if (!status) {
      setUpdateFeedback("Please select a status.");
      return;
    }

    setIsUpdatingStatus(true);
    setUpdateFeedback(null);
    try {
      await updateOrderStatus(order.id, status);
      setOrder((prev) => (prev ? { ...prev, status } : prev));
      setUpdateFeedback("Status updated successfully.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update status.";
      setUpdateFeedback(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const calculatedSubtotal = React.useMemo(() => {
    if (!order || !order.details) return 0;
    return order.details.reduce((sum, product) => sum + (product.total || 0), 0);
  }, [order?.details]);

  return (
    <div className="order-detail-container">
       <button className="back-button" onClick={() => navigate("/Orders")}>
          {"<-"} Danh sách các đơn hàng
        </button>
      <div className="order-detail-header">
        {order && (
          <div className="order-info-summary">
            <h3 className="order-id">Mã đơn hàng: #{order.id}</h3>
          </div>
        )}
        <div className="status-update">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">-- Chọn trạng thái --</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleUpdateStatus}
            disabled={isUpdatingStatus || !order}
          >
            {isUpdatingStatus ? "Updating..." : "Cập nhật"}
          </button>
          {updateFeedback && (
            <span
              className={`status-feedback ${
                updateFeedback.includes("successfully") ? "success" : "error"
              }`}
            >
              {updateFeedback}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="order-feedback">Loading order details...</div>
      )}
      {error && <div className="order-feedback error">{error}</div>}

      {order && !isLoading && !error && (
        <>
          <div style={{ marginBottom: "20px", marginTop: "50px" }}>
            <OrderSteps status={(order.status) as any} />
          </div>

          <div className="order-detail-content">
            <h3 className="product-list-order">Danh sách sản phẩm</h3>
            <div className="product-items-order">
              {order.details.map((product) => (
                <div className="product-item-order" key={product.id}>
                  {product.images && product.images.length > 0 && (
                    <div className="product-images">
                      {product.images.slice(0, 1).map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`${product.title} ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="product-info-order">
                    <div className="product-name-title">
                      <h4 className="product-title">{product.title}</h4>
                      <p className="product-name">
                        {product.description || "No description"}
                      </p>
                    </div>

                    <p className="product-quantity">
                      Số lượng: {product.quantity}
                    </p>
                    <p className="product-price">
                      Giá sản phẩm: {formatCurrency(product.price)}
                    </p>
                    <p className="product-price">
                      Tổng giá: {formatCurrency(product.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shipping-address">
            <h3 className="shipping-address-title">Thông tin giao hàng</h3>
            <div className="address-info-border">
              <div className="name-phone">
                <p>Tên người nhận:</p>
                <p className="content-name-info">
                  {order.customer} | {order.phone ?? "N/A"}
                </p>
              </div>
              <div className="address-detail">
                <p>Địa chỉ giao hàng:</p>
                <p className="content-address-info">{order.address ?? "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="payment-method-container">
            <h3 className="payment-method">Tiền thanh toán</h3>
            <div className="total-info-border">
              <div className="subtotal">
                <p>Ước tính:</p>
                <p>{formatCurrency(calculatedSubtotal)}</p>
              </div>
              <div className="shipping-charge">
                <p>Phí vận chuyển:</p>
                <p>{formatCurrency(order.shipPrice)}</p>
              </div>
              <div className="line-order-detail-payment"></div>
              <div className="total">
                <p>Tổng thanh toán</p>
                <p>{formatCurrency(order.payPrice)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetail;
