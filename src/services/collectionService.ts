import { apiRequest } from "./apiClient";

export interface CollectionSummary {
  id: number;
  name: string;
  descript?: string | null;
}

interface BackendCollection {
  id: number;
  name?: string | null;
  descript?: string | null;
}

const mapCollection = (collection: BackendCollection): CollectionSummary => ({
  id: collection.id,
  name: collection.name?.trim() || `Collection #${collection.id}`,
  descript: collection.descript,
});

export async function fetchCollections(): Promise<CollectionSummary[]> {
  const collections = await apiRequest<BackendCollection[]>("Collection/GetAll");
  return collections.map(mapCollection);
}

