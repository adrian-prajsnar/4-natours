import axios from 'axios'
import { LoginResponse } from './types.js'
import { showAlert } from './alerts.js'

interface ErrorResponseData {
  message: string
}

export const login = async (email: string, password: string): Promise<void> => {
  try {
    const baseURL = document.querySelector('main')?.dataset.url
    if (!baseURL) throw new Error('Base URL not found')

    const url = `${baseURL}/api/v1/users/login`

    const res = await axios<LoginResponse>({
      method: 'POST',
      url,
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
