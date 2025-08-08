import axios from 'axios'
import { ErrorResponseData } from './login'
import { showAlert } from './alerts'
import { UserResponse } from './types'

const PROJECT_URL = document.querySelector('main')?.dataset.projectUrl ?? '-'

export const updateData = async (email: string, name: string) => {
  try {
    const res = await axios<UserResponse>({
      method: 'PATCH',
      url: `${PROJECT_URL}/api/v1/users/updateMe`,
      data: {
        email,
        name,
      },
    })

    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!')
    }
  } catch (err: unknown) {
    if (
      axios.isAxiosError<ErrorResponseData>(err) &&
      err.response?.data.message
    ) {
      showAlert('error', err.response.data.message)
      return
    }
    showAlert('error', 'An unexpected error occurred during login')
  }
}
