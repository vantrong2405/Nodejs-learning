import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const access_token = searchParams.get('access_token')
    const refresh_token = searchParams.get('refresh_token')
    const new_user = searchParams.get('new_user')
    const verify = searchParams.get('verify')
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    console.log("🚀 ~ useEffect ~ new_user:", new_user)
    console.log("🚀 ~ useEffect ~ verify:", verify)
    navigate('/')
  }, [searchParams, navigate])

  return <div>Login</div>
}
