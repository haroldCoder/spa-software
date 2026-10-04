export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export class HttpClient {
  public static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(endpoint, {
      credentials: 'same-origin',
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `Error en la petición HTTP: ${response.status} ${response.statusText}`;
      
      const error: Error & { status: number; code?: string; details?: unknown } = new Error(errorMessage) as any;
      error.status = response.status;
      error.code = data?.error?.code;
      error.details = data?.error?.details;
      throw error;
    }

    // Backend HttpResponse envelopes in { success: true, data: T }
    return data?.data !== undefined ? data.data : data;
  }

  public static get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public static post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
