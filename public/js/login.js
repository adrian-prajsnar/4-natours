const login = async (email, password) => {
  try {
    const baseURL = document.querySelector('main').dataset.url
    const url = `${baseURL}/api/v1/users/login`

    const res = await axios({
      method: 'POST',
      url: url,
      data: {
        email,
        password,
      },
    })

    if (res.data.status === 'success') {
      alert('Logged in successfully!')
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (err) {
    alert(err.response.data.message)
  }
}

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  login(email, password)
})
