import './App.css';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useEffect } from 'react';
import axios from 'axios';
function App() {
  useEffect(() => {
    const controller = new AbortController();
    const fetchUserData = async () => {
      try {
        const result = await axios.get('/users/me', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('access_token'), //the token is a variable which holds the token
          },
          baseURL: import.meta.env.VITE_API_URL,
          signal: controller.signal
        });
        if(result.status=== 200){
          localStorage.setItem('profile', JSON.stringify(result.data.result)); //the data is stored in a variable which holds the data
        }
        console.log('🚀 ~ useEffect ~ result:', result);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
