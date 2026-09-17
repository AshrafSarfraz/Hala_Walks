import {BASE_URL} from '../../../config/api';

// Authentication must use the same backend as chat/privacy. Otherwise a
// production-issued token is sent to local MongoDB and the user cannot update
// their privacy settings.
export const API_BASE_URL = `${BASE_URL}/api`;

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
