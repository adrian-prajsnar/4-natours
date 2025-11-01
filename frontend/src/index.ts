import { login, logout } from './login'
import { displayMap } from './mapBox'
import { showAlert } from './alerts'
import { ILocation } from '../../backend/src/models/tourModel'
import { updateSettings } from './updateSettings'
import { bookTour } from './stripe'

const successMessage = sessionStorage.getItem('updateSuccess')
if (successMessage) {
  showAlert('success', successMessage)
  sessionStorage.removeItem('updateSuccess')
}

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book-tour')

if (mapBox) {
  const locationsData = mapBox.dataset.locations
  if (locationsData) {
    const locations = JSON.parse(locationsData) as ILocation[]
    displayMap(locations)
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault()
    const email = document.getElementById('email') as HTMLInputElement
    const password = document.getElementById('password') as HTMLInputElement
    if (email.value && password.value) {
      void login(email.value, password.value)
    } else {
      showAlert('error', 'Please provide email and password')
    }
  })
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => void logout())
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e: Event) => {
    void (async () => {
      e.preventDefault()
      const name = document.getElementById('name') as HTMLInputElement
      const email = document.getElementById('email') as HTMLInputElement
      const photo = document.getElementById('photo') as HTMLInputElement

      const formData = new FormData()
      if (name.value) formData.append('name', name.value)
      if (email.value) formData.append('email', email.value)
      if (photo.files?.[0]) formData.append('photo', photo.files[0])

      await updateSettings({
        data: formData,
        type: 'data',
      })
    })()
  })
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', e => {
    void (async () => {
      e.preventDefault()
      const btn = document.querySelector<HTMLButtonElement>(
        '.btn--save-password'
      )
      if (!btn) {
        return new Error('Unexpected error: btn not selected')
      }
      btn.textContent = 'Updating...'

      const currentPassword = document.getElementById(
        'password-current'
      ) as HTMLInputElement
      const newPassword = document.getElementById(
        'password'
      ) as HTMLInputElement
      const newPasswordConfirm = document.getElementById(
        'password-confirm'
      ) as HTMLInputElement

      if (
        currentPassword.value &&
        newPassword.value &&
        newPasswordConfirm.value
      ) {
        await updateSettings({
          data: {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
            newPasswordConfirm: newPasswordConfirm.value,
          },
          type: 'password',
        })
        btn.textContent = 'Save password'
        currentPassword.value = ''
        newPassword.value = ''
        newPasswordConfirm.value = ''
      } else {
        showAlert('error', 'Please provide correct data')
      }
    })()
  })
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLButtonElement
    target.textContent = 'Processing...'
    const tourId = target.dataset.tourId
    if (!tourId) {
      throw new Error('Tour ID not found')
    }
    void bookTour(tourId)
  })
}

const alertMessage = document.querySelector('body')?.dataset.alert
console.log('Alert message from dataset:', alertMessage)
console.log('Body element:', document.querySelector('body'))
console.log('Body dataset:', document.querySelector('body')?.dataset)
if (alertMessage) {
  showAlert('success', alertMessage, 20)
}
