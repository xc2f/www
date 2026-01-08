// lib/api-client/request.ts
export type ApiError = {
  status: number
  message: string
}

export type ApiResponse<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      error: ApiError
    }

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: HeadersInit
  credentials?: RequestCredentials
}

export async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: options.credentials ?? 'include',
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    // HTTP 错误（404 / 500）
    if (!res.ok) {
      const message = await safeReadMessage(res)
      return {
        ok: false,
        error: {
          status: res.status,
          message,
        },
      }
    }

    // 204 No Content
    if (res.status === 204) {
      return {
        ok: true,
        data: undefined as T,
      }
    }

    const data = (await res.json()) as T

    return {
      ok: true,
      data,
    }
  } catch (err) {
    // 网络错误 / CORS / JSON 解析错误
    return {
      ok: false,
      error: {
        status: 0,
        message: err instanceof Error ? err.message : 'Unknown network error',
      },
    }
  }
}

async function safeReadMessage(res: Response): Promise<string> {
  try {
    const json = await res.json()
    if (json?.message) return json.message
  } catch {}

  return res.statusText || 'Request failed'
}
