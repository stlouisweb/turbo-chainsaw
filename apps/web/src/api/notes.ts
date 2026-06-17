export interface Note {
  id: number;
  title: string;
  content: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: options?.body != null ? { 'Content-Type': 'application/json' } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((body as { message?: string }).message ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const notesApi = {
  list: () => request<Note[]>('/api/notes'),
  get: (id: number) => request<Note>(`/api/notes/${id}`),
  create: (data: { title?: string; content?: string }) =>
    request<Note>('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { title?: string; content?: string }) =>
    request<Note>(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/api/notes/${id}`, { method: 'DELETE' }),
};
