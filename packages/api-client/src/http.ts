// Base fetch wrapper — replace with a typed client (ky, ofetch, etc.) when needed
export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = process.env.API_URL ?? "http://localhost:3001"
  const res = await fetch(`${base}${path}`, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}
