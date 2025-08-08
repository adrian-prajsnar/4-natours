import axios from 'axios'
import { showAlert } from './alerts.js'
import { UserResponse, LogoutResponse } from './types.js'

export interface ErrorResponseData {
  message: string
}

const PROJECT_URL = document.querySelector('main')?.dataset.projectUrl ?? '-'

export const login = async (email: string, password: string): Promise<void> => {
  try {
    const res = await axios<UserResponse>({
      method: 'POST',
      url: `${PROJECT_URL}/api/v1/users/login`,
      data: {
        email,
        password,
      },
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!')
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (err: unknown) {
    if (
      axios.isAxiosError<ErrorResponseData>(err) &&
      err.response?.data.message
    ) {
      showAlert('error', err.response.data.message)
      return
    }
    showAlert('error', 'An error occurred during login')
  }
}

export const logout = async () => {
  try {
    const res = await axios<LogoutResponse>({
      method: 'GET',
      url: `${PROJECT_URL}/api/v1/users/logout`,
    })
    if (res.data.status === 'success') {
      location.href = '/'
      showAlert('success', 'Logged out successfully!')
    }
  } catch {
    showAlert('error', 'Error logging out! Try again.')
  }
}
