export const apiClient = {
  async get<T>(path: string): Promise<T> { throw new Error(`API is not connected: GET ${path}`); },
  async post<T>(path: string, _payload: unknown): Promise<T> { throw new Error(`API is not connected: POST ${path}`); },
};
