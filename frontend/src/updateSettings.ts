import axios from 'axios'
import { ErrorResponseData } from './login'
import { showAlert } from './alerts'
import { UserResponse } from './types'

const PROJECT_URL = document.querySelector('main')?.dataset.projectUrl ?? '-'

interface UpdateSettingsArg {
  data:
    | FormData
    | {
        email?: string
        name?: string
        currentPassword?: string
        newPassword?: string
        newPasswordConfirm?: string
      }
  type: 'password' | 'data'
}

export const updateSettings = async ({ data, type }: UpdateSettingsArg) => {
  try {
    const res = await axios<UserResponse>({
      method: 'PATCH',
      url: `${PROJECT_URL}/api/v1/users/update${type === 'password' ? 'MyPassword' : 'Me'}`,
      data,
    })

    if (res.data.status === 'success') {
      sessionStorage.setItem(
        'updateSuccess',
        `User's ${type} updated successfully!`
      )
      location.reload()
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
