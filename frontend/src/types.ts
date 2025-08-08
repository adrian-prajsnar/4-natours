import mapboxgl from 'mapbox-gl'
import { IUser } from '../../backend/src/models/userModel'

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

export interface UserResponse {
  status: 'success' | 'fail'
  data: {
    user: IUser
  }
}

export interface LogoutResponse {
  status: 'success' | 'fail'
}

declare global {
  interface Window {
    mapboxgl: typeof mapboxgl
  }
}
