export const DIRECTORY_URL =
  'https://hala-b-saudi.onrender.com/hr/employees/mongo';
export function directoryRows(payload: any) {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.employees ?? payload?.data;
  if (!Array.isArray(rows)) throw new Error('Invalid directory response');
  return rows.map((item: any, index: number) => ({
    id: String(item._id ?? item.id ?? index),
    name: String(item.Name ?? item.name ?? ''),
    position: String(item.Title ?? item.position ?? ''),
    phone: String(item.MobilePhone ?? item.phone ?? ''),
  }));
}
export async function fetchDirectory(timeout = 12000) {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(DIRECTORY_URL, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Directory request failed');
        return directoryRows(await response.json());
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Directory request timed out'));
          controller.abort();
        }, timeout);
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}
