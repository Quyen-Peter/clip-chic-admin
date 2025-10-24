import { apiRequest, API_BASE_URL } from "./apiClient";

interface BackendOrderDetail {
  id: number;
  quantity?: number | null;
  price?: number | null;
  productId?: number | null;
  product?: {
    id: number;
    title?: string | null;
    descript?: string | null;
    price?: number | null;
    images?: { id: number; name?: string | null; address?: string | null }[] | null;
  } | null;
  blindBoxId?: number | null;
  blindBox?: {
    id: number;
    name?: string | null;
    descript?: string | null;
    price?: number | null;
    images?: { id: number; name?: string | null; address?: string | null }[] | null;
  } | null;
}

interface BackendOrder {
  id: number;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  createDate?: string | null;
  totalPrice?: number | null;
  shipPrice?: number | null;
  payPrice?: number | null;
  status?: string | null;
  payMethod?: string | null;
  orderDetails?: BackendOrderDetail[] | null;
  user?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}

export interface OrderProductLine {
  id: number;
  productId?: number;
  kind?: "product" | "blindBox";
  title: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  images: string[];
}

export interface OrderListItem {
  id: number;
  customer: string;
  date: string;
  total: number;
  products: number;
  status?: string;
  shipPrice: number;
  payPrice: number;
  phone?: string;
  address?: string;
  details: OrderProductLine[];
}

export interface OrderDetailData extends OrderListItem {
  subtotal: number;
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

const mapOrderLines = (order: BackendOrder): OrderProductLine[] =>
  (order.orderDetails ?? []).map((detail) => {
    const quantity = Number(detail.quantity ?? 0);
    const isProduct = !!detail.product || !!detail.productId;

    const title = isProduct
      ? (detail.product?.title?.trim() || `Product ${detail.productId ?? detail.id}`)
      : (detail.blindBox?.name?.trim() || `Blind Box ${detail.blindBoxId ?? detail.id}`);

    const description = isProduct
      ? (detail.product?.descript?.trim() || "")
      : (detail.blindBox?.descript?.trim() || "");

    const priceSource = isProduct
      ? detail.product?.price
      : detail.blindBox?.price;
    const unitPrice = Number(priceSource ?? 0);
    const lineTotal = Number(detail.price) || (quantity * unitPrice);

    const images = (isProduct
      ? (detail.product?.images ?? [])
      : (detail.blindBox?.images ?? [])
    )
      .map((img) => img?.address)
      .filter((addr): addr is string => typeof addr === "string" && addr.length > 0);

    return {
      id: detail.id,
      productId: isProduct
        ? (detail.productId ?? detail.product?.id ?? undefined)
        : undefined,
      kind: isProduct ? "product" : "blindBox",
      title,
      description,
      quantity,
      price: unitPrice,
      total: lineTotal,
      images,
    };
  });

const mapOrderBase = (order: BackendOrder) => {
  const details = mapOrderLines(order);
  const subtotal = details.reduce((sum, line) => sum + line.total, 0);
  const shipPrice = Number(order.shipPrice ?? 0);
  const payPrice = Number(order.payPrice ?? subtotal + shipPrice);

  return {
    id: order.id,
    customer: getOrderCustomer(order),
    date: getOrderDate(order),
    total: subtotal,
    products: details.reduce((sum, line) => sum + line.quantity, 0),
    status: order.status ?? undefined,
    shipPrice,
    payPrice,
    phone: order.phone ?? order.user?.phone ?? undefined,
    address: order.address ?? order.user?.address ?? undefined,
    details,
    subtotal,
  };
};

const mapOrder = (order: BackendOrder): OrderListItem => {
  const base = mapOrderBase(order);
  return {
    id: base.id,
    customer: base.customer,
    date: base.date,
    total: base.payPrice,
    products: base.products,
    status: base.status,
    shipPrice: base.shipPrice,
    payPrice: base.payPrice,
    phone: base.phone,
    address: base.address,
    details: base.details,
  };
};

const mapOrderDetail = (order: BackendOrder): OrderDetailData => {
  const base = mapOrderBase(order);
  return {
    id: base.id,
    customer: base.customer,
    date: base.date,
    total: base.payPrice,
    products: base.products,
    status: base.status,
    shipPrice: base.shipPrice,
    payPrice: base.payPrice,
    phone: base.phone,
    address: base.address,
    details: base.details,
    subtotal: base.subtotal,
  };
};

const ORDER_BASE_PATH = "api/Order";

export async function fetchOrders(): Promise<OrderListItem[]> {
  const orders = await apiRequest<BackendOrder[]>(ORDER_BASE_PATH);
  return orders.map(mapOrder);
}

export async function fetchOrderById(id: number): Promise<OrderDetailData> {
  try {
    const order = await apiRequest<BackendOrder>(`${ORDER_BASE_PATH}/${id}`);
    return mapOrderDetail(order);
  } catch (primaryError) {
    const orders = await apiRequest<BackendOrder[]>(ORDER_BASE_PATH);
    const found = orders.find((order) => order.id === id);
    if (!found) {
      throw primaryError;
    }
    return mapOrderDetail(found);
  }
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
  const url = `${API_BASE_URL}/${ORDER_BASE_PATH}/update-status/${orderId}?status=${encodeURIComponent(
    status
  )}`;
  const response = await fetch(url, { method: "PUT" });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to update status (HTTP ${response.status})`
    );
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as { message: string };
  }

  const text = await response.text();
  return { message: text || "Updated" };
}

export async function updateOrderPayMethod(orderId: number, method: string) {
  const url = `${API_BASE_URL}/${ORDER_BASE_PATH}/update-paymethod/${orderId}?method=${encodeURIComponent(
    method
  )}`;
  const response = await fetch(url, { method: "PUT" });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || `Failed to update payment method (HTTP ${response.status})`
    );
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as { message: string };
  }

  const text = await response.text();
  return { message: text || "Updated" };
}
