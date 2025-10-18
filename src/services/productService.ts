import { apiRequest } from "./apiClient";

interface BackendImage {
  id: number;
  name?: string | null;
  address?: string | null;
}

interface BackendProduct {
  id: number;
  title?: string | null;
  descript?: string | null;
  stock?: number | null;
  Totalprice?: number | null;
  Images?: BackendImage[] | null;
}

export interface ProductListItem {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
}

export interface CreateProductPayload {
  collectId?: number | null;
  baseId?: number | null;
  modelId?: number | null;
  userId?: number | null;
  title: string;
  descript?: string;
  price?: number | null;
  stock?: number | null;
  createDate?: string | null;
  status?: string;
  images?: File[];
}

const normalizeImage = (image?: BackendImage | null) =>
  image?.address?.trim() || image?.name?.trim() || undefined;

const mapProduct = (product: BackendProduct): ProductListItem => ({
  id: product.id,
  title: product.title?.trim() || "Untitled product",
  description: product.descript?.trim() || "",
  price: Number(product.Totalprice ?? 0),
  stock: Number(product.stock ?? 0),
  image: normalizeImage(product.Images?.[0]),
});

export async function fetchProducts(): Promise<ProductListItem[]> {
  const data = await apiRequest<BackendProduct[]>("Product/GetAll");
  return data.map(mapProduct);
}

export async function createProduct(
  payload: CreateProductPayload
): Promise<ProductListItem> {
  const formData = new FormData();

  const appendIfDefined = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, String(value));
  };

  appendIfDefined("collectId", payload.collectId);
  appendIfDefined("title", payload.title);
  appendIfDefined("descript", payload.descript ?? "");
  appendIfDefined("baseId", payload.baseId);
  appendIfDefined("price", payload.price);
  appendIfDefined("userId", payload.userId);
  appendIfDefined("stock", payload.stock);
  appendIfDefined("modelId", payload.modelId);
  appendIfDefined(
    "createDate",
    payload.createDate ?? new Date().toISOString()
  );
  appendIfDefined("status", payload.status ?? "active");

  payload.images?.forEach((file) => {
    formData.append("Images", file);
  });

  const created = await apiRequest<BackendProduct>("Product/Create", {
    method: "POST",
    body: formData,
  });

  return mapProduct(created);
}
