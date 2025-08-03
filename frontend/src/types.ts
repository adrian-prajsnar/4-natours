import mapboxgl from 'mapbox-gl'

export interface ApiErrorResponse {
  status: 'fail' | 'error'
  message: string
}

export function isApiErrorResponse(obj: unknown): obj is ApiErrorResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'status' in obj &&
    (('status' in obj && (obj as { status: unknown }).status === 'fail') ||
      (obj as { status: unknown }).status === 'error') &&
    'message' in obj &&
    typeof (obj as { message: unknown }).message === 'string'
  )
}

export interface LoginResponse {
  status: 'success' | 'fail' | 'error'
  data: {
    user: {
      name: string
      email: string
      role: string
    }
  }
}

export interface LogoutResponse {
  status: 'success' | 'error'
}

declare global {
  interface Window {
    mapboxgl: typeof mapboxgl
  }
}
