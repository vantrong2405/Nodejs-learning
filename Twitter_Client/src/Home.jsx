import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Link } from 'react-router-dom'

const getOauthGoogleUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_AUTHORIZED_REDIRECT_URI } =
    import.meta.env
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: VITE_GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: VITE_GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  }
  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`
}

function Home() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const oauthURL = getOauthGoogleUrl()
  const profile = JSON.parse(localStorage.getItem('profile')) ||  {}
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
  }
  return (
    <>
      <div>
        <div>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </div>
        <div>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </div>
      </div>
 <video controls width={500}>
  <source src='http://localhost:4000/static/video/dNvH3nSmX-31hIs0Yii9p/dNvH3nSmX-31hIs0Yii9p.mp4' type='video/mp4'></source>
 </video>
      <h1>OAuth Google</h1>
      <div>
        {isAuthenticated ? (
          <div>
            <p>Xin chào, bạn <strong>{profile.email}</strong> đã login thành công</p>
            <button onClick={logout}>Click để logout</button>
          </div>
        ) : (
          <Link to={oauthURL}>Login with Google</Link>
        )}
      </div>
    </>
  )
}

export default Home
