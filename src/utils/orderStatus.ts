export const getOrderStatus = (status?: string) => {
  // Nếu status null/undefined → return unknown
  if (!status || typeof status !== "string") {
    return { text: "không xác định", className: "status unknown" };
  }

  switch (status.toLowerCase()) {
    case "pending":
      return { text: "chưa xử lý", className: "status pending" };
    case "payment":
      return { text: "đang chờ xử lý", className: "status payment" };
    case "processing":
      return { text: "đã xác nhận (đang chờ vận chuyển)", className: "status processing" };
    case "shipping":
      return { text: "đang giao hàng", className: "status shipping" };
    case "delivered":
      return { text: "giao hàng thành công", className: "status delivered" };
    case "cancelled":
      return { text: "đã hủy", className: "status cancelled" };
    case "refunded":
      return { text: "đã hoàn tiền", className: "status refunded" };
    case "returned":
      return { text: "đã trả hàng", className: "status returned" };
    case "failed":
      return { text: "thanh toán thất bại", className: "status failed" };
    default:
      return { text: "không xác định", className: "status unknown" };
  }
};
