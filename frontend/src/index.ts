import { login, logout } from './login'
import { displayMap } from './mapBox'
import { showAlert } from './alerts'
import { ILocation } from '../../backend/src/models/tourModel'

const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')
const logoutBtn = document.querySelector('.nav__el--logout')

const email = document.getElementById('email') as HTMLInputElement
const password = document.getElementById('password') as HTMLInputElement

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
