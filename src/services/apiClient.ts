const DEFAULT_API_BASE_URL = "https://clipnchic-cnaeasa8eyftfqcg.southeastasia-01.azurewebsites.net";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

export const API_BASE_URL = normalizeBaseUrl(
  process.env.REACT_APP_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;

  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.clone().json();
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Ignore JSON parsing failures and fall back to status text
  }

  return `Request failed with status ${response.status} (${response.statusText})`;
}
