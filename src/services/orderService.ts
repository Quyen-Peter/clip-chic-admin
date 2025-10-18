import { apiRequest } from "./apiClient";

interface BackendOrderDetail {
  id: number;
  quantity?: number | null;
  price?: number | null;
}

interface BackendOrder {
  id: number;
  name?: string | null;
  createDate?: string | null;
  totalPrice?: number | null;
  payPrice?: number | null;
  status?: string | null;
  orderDetails?: BackendOrderDetail[] | null;
  user?: {
    name?: string | null;
  } | null;
}

export interface OrderListItem {
  id: number;
  customer: string;
  date: string;
  total: number;
  products: number;
  status?: string;
}

const getOrderCustomer = (order: BackendOrder) =>
  order.name?.trim() ||
  order.user?.name?.trim() ||
  `Order #${order.id}`;

const getOrderDate = (order: BackendOrder) => {
  if (!order.createDate) return "";
  const date = new Date(order.createDate);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const getProductCount = (order: BackendOrder) =>
  (order.orderDetails ?? []).reduce(
    (total, detail) => total + Number(detail.quantity ?? 0),
    0
  );

const mapOrder = (order: BackendOrder): OrderListItem => ({
  id: order.id,
  customer: getOrderCustomer(order),
  date: getOrderDate(order),
  total: Number(order.payPrice ?? order.totalPrice ?? 0),
  products: getProductCount(order),
  status: order.status ?? undefined,
});

const ORDER_BASE_PATH = "api/Order";

export async function fetchOrders(): Promise<OrderListItem[]> {
  const orders = await apiRequest<BackendOrder[]>(ORDER_BASE_PATH);
  return orders.map(mapOrder);
}

export async function fetchPendingOrder(userId: number) {
  return apiRequest<BackendOrder>(`${ORDER_BASE_PATH}/pending/${userId}`);
}

export async function addOrderDetail(params: {
  productId: number;
  quantity: number;
  price: number;
}) {
  const { productId, quantity, price } = params;
  return apiRequest<BackendOrder>(
    `${ORDER_BASE_PATH}/add-detail?productId=${productId}&quantity=${quantity}&price=${price}`,
    { method: "POST" }
  );
}

export async function deleteOrderDetail(userId: number, orderDetailId: number) {
  return apiRequest<BackendOrder | { message: string }>(
    `${ORDER_BASE_PATH}/delete-detail/${userId}/${orderDetailId}`,
    { method: "DELETE" }
  );
}

export async function updateOrderStatus(orderId: number, status: string) {
  return apiRequest<string>(
    `${ORDER_BASE_PATH}/update-status/${orderId}?status=${encodeURIComponent(
      status
    )}`,
    { method: "PUT" }
  );
}

export async function updateOrderPayMethod(orderId: number, method: string) {
  return apiRequest<string>(
    `${ORDER_BASE_PATH}/update-paymethod/${orderId}?method=${encodeURIComponent(
      method
    )}`,
    { method: "PUT" }
  );
}
