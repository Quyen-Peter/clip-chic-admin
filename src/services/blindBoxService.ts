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

interface BackendBlindBox {
  id: number;
  collectId?: number | null;
  name?: string | null;
  descript?: string | null;
  price?: number | null;
  stock?: number | null;
  status?: string | null;
  collection?: BackendCollection | null;
  Images?: BackendImage[] | null;
  images?: BackendImage[] | null;
}

export interface BlindBoxListItem {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status?: string;
  collectionId?: number;
  collectionName?: string;
  image?: string;
}

export interface BlindBoxImage {
  id: number;
  url: string;
  name?: string;
}

export interface BlindBoxDetail extends BlindBoxListItem {
  images: BlindBoxImage[];
  collectionDescription?: string;
}

export interface CreateBlindBoxPayload {
  collectId: number;
  name: string;
  descript: string;
  price: number;
  stock: number;
  status: string;
  images?: File[];
}

export interface UpdateBlindBoxPayload {
  id: number;
  collectId?: number;
  name?: string;
  descript?: string;
  price?: number | null;
  stock?: number | null;
  status?: string | null;
}

const extractImages = (blindBox: BackendBlindBox): BlindBoxImage[] => {
  const images = blindBox.Images ?? blindBox.images ?? [];
  return images
    .map((image) => ({
      id: image.id,
      url: image.address?.trim() ?? "",
      name: image.name ?? undefined,
    }))
    .filter((image) => !!image.url);
};

const mapBlindBox = (blindBox: BackendBlindBox): BlindBoxListItem => {
  const images = extractImages(blindBox);
  return {
    id: blindBox.id,
    name: blindBox.name?.trim() || "Untitled blindbox",
    description: blindBox.descript?.trim() || "",
    price: Number(blindBox.price ?? 0),
    stock: Number(blindBox.stock ?? 0),
    status: blindBox.status ?? undefined,
    collectionId: blindBox.collectId ?? blindBox.collection?.id ?? undefined,
    collectionName: blindBox.collection?.name ?? undefined,
    image: images[0]?.url,
  };
};

const mapBlindBoxDetail = (blindBox: BackendBlindBox): BlindBoxDetail => ({
  ...mapBlindBox(blindBox),
  images: extractImages(blindBox),
  collectionDescription: blindBox.collection?.descript ?? undefined,
});

export async function fetchBlindBoxes(): Promise<BlindBoxListItem[]> {
  const data = await apiRequest<BackendBlindBox[]>("BlindBox/GetAll");
  return data.map(mapBlindBox);
}

export async function fetchBlindBoxById(
  id: number
): Promise<BlindBoxDetail> {
  const data = await apiRequest<BackendBlindBox>(`BlindBox/GetById/${id}`);
  return mapBlindBoxDetail(data);
}

export async function createBlindBox(
  payload: CreateBlindBoxPayload
): Promise<BlindBoxDetail> {
  const formData = new FormData();
  formData.append("collectId", String(payload.collectId));
  formData.append("name", payload.name);
  formData.append("descript", payload.descript);
  formData.append("price", String(payload.price));
  formData.append("stock", String(payload.stock));
  formData.append("status", payload.status);
  payload.images?.forEach((file) => formData.append("Images", file));

  const created = await apiRequest<BackendBlindBox>("BlindBox/Create", {
    method: "POST",
    body: formData,
  });

  return mapBlindBoxDetail(created);
}

export async function updateBlindBox(payload: UpdateBlindBoxPayload) {
  return apiRequest<{ message: string }>("BlindBox/Update", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
