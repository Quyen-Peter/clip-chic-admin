import { apiRequest } from "./apiClient";

interface BackendImage {
  id: number;
  name?: string | null;
  address?: string | null;
}

interface BackendCollection {
  id: number;
  name?: string | null;
  descript?: string | null;
}

interface BackendModel {
  id: number;
  name?: string | null;
  address?: string | null;
}

interface BackendBase {
  id: number;
  name?: string | null;
  model?: BackendModel | null;
}

interface BackendProduct {
  id: number;
  title?: string | null;
  descript?: string | null;
  stock?: number | null;
  Totalprice?: number | null;
  totalprice?: number | null;
  price?: number | null;
  collectId?: number | null;
  collection?: BackendCollection | null;
  status?: string | null;
  createDate?: string | null;
  Images?: BackendImage[] | null;
  images?: BackendImage[] | null;
  model?: BackendModel | null;
  base?: BackendBase | null;
}

export interface ProductListItem {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  collectionId?: number;
  collectionName?: string;
  status?: string;
  createDate?: string;
  modelUrl?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  name?: string;
}

export interface ProductDetail extends ProductListItem {
  images: ProductImage[];
  collectionDescription?: string;
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

const extractPrice = (product: BackendProduct) =>
  Number(product.totalprice ?? product.Totalprice ?? product.price ?? 0);

const extractImages = (product: BackendProduct): ProductImage[] => {
  const images = product.Images ?? product.images ?? [];
  return images
    .map((img) => ({
      id: img.id,
      url: img.address?.trim() ?? "",
      name: img.name ?? undefined,
    }))
    .filter((img) => !!img.url);
};

const mapProduct = (product: BackendProduct): ProductListItem => {
  const images = extractImages(product);
  return {
    id: product.id,
    title: product.title?.trim() || "Untitled product",
    description: product.descript?.trim() || "",
    price: extractPrice(product),
    stock: Number(product.stock ?? 0),
    image: images[0]?.url,
    collectionId: product.collectId ?? product.collection?.id ?? undefined,
    collectionName: product.collection?.name?.trim(),
    status: product.status ?? undefined,
    createDate: product.createDate ?? undefined,
    modelUrl: product.model?.address ?? undefined,
  };
};

const mapProductDetail = (product: BackendProduct): ProductDetail => ({
  ...mapProduct(product),
  images: extractImages(product),
  collectionDescription: product.collection?.descript ?? undefined,
});

export async function fetchProducts(): Promise<ProductListItem[]> {
  const data = await apiRequest<BackendProduct[]>("Product/GetAll");
  return data.map(mapProduct);
}

export async function fetchCustomProducts(): Promise<ProductListItem[]> {
  const data = await apiRequest<BackendProduct[]>("Product/GetAllCustom");
  return data.map(mapProduct);
}

export async function fetchProductById(id: number): Promise<ProductDetail> {
  const data = await apiRequest<BackendProduct>(`Product/GetById/${id}`);
  return mapProductDetail(data);
}

export interface UpdateProductPayload {
  id: number;
  collectId?: number | null;
  title?: string;
  descript?: string | null;
  baseId?: number | null;
  price?: number | null;
  userId?: number | null;
  stock?: number | null;
  modelId?: number | null;
  createDate?: string | null;
  status?: string | null;
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

export async function updateProduct(payload: UpdateProductPayload) {
  const response = await apiRequest<{ message: string }>("Product/Update", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response;
}
