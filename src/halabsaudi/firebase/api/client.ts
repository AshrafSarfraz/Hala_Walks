
export const API_BASE_URL = 'https://hala-b-saudi.onrender.com/api';

export async function apiPost<T = any>(
  path: string,
  body: any,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.message || `Request failed with status ${res.status}`;
    const error: any = new Error(message);
    error.status = res.status;
    error.raw = data;
    throw error;
  }

  return data;
}
