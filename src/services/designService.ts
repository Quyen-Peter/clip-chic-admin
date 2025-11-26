import { apiRequest } from "./apiClient";
import { ProductListItem } from "./productService";

export type Vector3Tuple = [number, number, number];

export interface CharmAsset {
  id: number;
  name: string;
  imageUrl?: string;
  modelUrl?: string;
}

export interface CharmPlacement {
  id: string;
  modelPath: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
}

export interface ProductSceneConfig {
  baseModel: string;
  baseModelColor: string;
  charms: CharmPlacement[];
}

const DEFAULT_POSITION: Vector3Tuple = [0, 0, 0];
const DEFAULT_ROTATION: Vector3Tuple = [0, 0, 0];
const DEFAULT_SCALE: Vector3Tuple = [0.5, 0.5, 0.5];

const toVector = (
  value: unknown,
  fallback: Vector3Tuple
): Vector3Tuple => {
  if (Array.isArray(value) && value.length >= 3) {
    const parsed = value
      .slice(0, 3)
      .map((item) => (typeof item === "number" ? item : Number(item)));
    if (parsed.every((num) => Number.isFinite(num))) {
      return parsed as Vector3Tuple;
    }
  }
  return fallback;
};

const normalizeCharm = (
  rawCharm: any,
  index: number
): CharmPlacement | null => {
  const modelPath =
    (typeof rawCharm?.modelPath === "string" && rawCharm.modelPath.trim()) ||
    (typeof rawCharm?.model?.address === "string" &&
      rawCharm.model.address.trim());

  if (!modelPath) {
    return null;
  }

  const id =
    (typeof rawCharm?.id === "string" && rawCharm.id.trim()) ||
    (typeof rawCharm?.charmId === "string" && rawCharm.charmId.trim()) ||
    `charm-${index}`;

  return {
    id,
    modelPath,
    position: toVector(rawCharm?.position, DEFAULT_POSITION),
    rotation: toVector(rawCharm?.rotation, DEFAULT_ROTATION),
    scale: toVector(rawCharm?.scale, DEFAULT_SCALE),
  };
};

export const filterDesignableProducts = (
  products: ProductListItem[]
): ProductListItem[] => {
  const allowedStatuses = new Set(["public", "private"]);
  return products.filter(
    (product) =>
      product.status &&
      allowedStatuses.has(product.status.toLowerCase()) &&
      !!product.modelUrl
  );
};

const normalizeCharmAsset = (raw: any): CharmAsset | null => {
  if (raw == null) return null;
  const modelUrl =
    (typeof raw?.modelPath === "string" && raw.modelPath.trim()) ||
    (typeof raw?.model?.address === "string" && raw.model.address.trim()) ||
    undefined;
  const imageUrl =
    (typeof raw?.previewImage === "string" && raw.previewImage.trim()) ||
    (typeof raw?.image?.address === "string" && raw.image.address.trim()) ||
    undefined;

  const idValue = Number(raw?.id);
  if (!Number.isFinite(idValue)) return null;

  return {
    id: idValue,
    name: (raw?.name ?? raw?.title ?? `Charm ${idValue}`).toString(),
    imageUrl,
    modelUrl,
  };
};

export const fetchCharmAssets = async (): Promise<CharmAsset[]> => {
  const data = await apiRequest<any[]>("Charm/GetAll");
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => normalizeCharmAsset(item))
    .filter((item): item is CharmAsset => Boolean(item));
};

export const fetchProductSceneConfig = async (
  modelUrl: string
): Promise<ProductSceneConfig> => {
  const data = await apiRequest<any>(modelUrl);

  const baseModel =
    (typeof data?.baseModel === "string" && data.baseModel.trim()) ||
    (typeof data?.baseModelPath === "string" && data.baseModelPath.trim());

  if (!baseModel) {
    throw new Error("3D configuration is missing base model information.");
  }

  const charmsRaw: unknown[] = Array.isArray(data?.charms) ? data.charms : [];
  const charms = charmsRaw
    .map((item, index) => normalizeCharm(item, index))
    .filter((item): item is CharmPlacement => Boolean(item));

  return {
    baseModel,
    baseModelColor:
      (typeof data?.baseModelColor === "string" && data.baseModelColor) ||
      "#ffffff",
    charms,
  };
};
