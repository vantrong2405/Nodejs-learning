export const accessToken = localStorage.getItem('access_token')
export const profile = JSON.parse(localStorage.getItem('profile')) || {}