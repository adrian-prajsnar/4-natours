const login = async (email, password) => {
  console.log('data:', email, password)
  try {
    const baseURL = document.querySelector('main').dataset.url
    const url = `${baseURL}/api/v1/users/login`
    console.log('url:', url)

    const res = await axios({
      method: 'POST',
      url: url,
      data: {
        email,
        password,
      },
    })
    console.log('res:', res)
  } catch (err) {
    console.error('err:', err.response.data)
  }
}

document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  login(email, password)
})
