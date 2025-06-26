import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { createAPIError, NetworkError } from "@/lib/errors";
import { logger } from "@/lib/logger";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    let errorDetails: any = null;
    
    try {
      const text = await res.text();
      if (text) {
        try {
          errorDetails = JSON.parse(text);
          if (errorDetails.message) {
            errorMessage = errorDetails.message;
          }
        } catch {
          errorMessage = text;
        }
      }
    } catch (e) {
      logger.error('Failed to parse error response', e, 'throwIfResNotOk');
    }
    
    const error = createAPIError(res, errorMessage);
    error.details = errorDetails;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const netError = new NetworkError('Unable to connect to the server');
      logger.error(`Network Error: ${method} ${url}`, netError, 'apiRequest');
      throw netError;
    }
    
    // Log API errors
    if (error instanceof Error) {
      logger.error(`API Error: ${method} ${url}`, error, 'apiRequest');
    }
    
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
