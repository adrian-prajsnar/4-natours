import { login, logout } from './login'
import { displayMap } from './mapBox'
import { showAlert } from './alerts'
import { ILocation } from '../../backend/src/models/tourModel'
import { updateData } from './updateSettings'

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')

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
  userDataForm.addEventListener('submit', e => {
    e.preventDefault()
    const name = document.getElementById('name') as HTMLInputElement
    const email = document.getElementById('email') as HTMLInputElement
    if (email.value || name.value) {
      void updateData(email.value, name.value)
    } else {
      showAlert('error', 'Please provide correct data')
    }
  })
}
