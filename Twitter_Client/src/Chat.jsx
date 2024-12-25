import { useEffect, useState } from 'react';
import socket from './socket';
import axios from 'axios';

export default function Chat() {
  const profile = JSON.parse(localStorage.getItem('profile')) || {};
  const usernames = [{
    name : 'user1',
    value : 'trongdn2405+15860'
  },
  {
    name : 'user2',
    value : 'trongdn2405+29157'
  }
];
  const [value, setValue] = useState('');
  const [conversations, setConversations] = useState([]); // dùng để render message
  const [receiver , setReceiver] = useState('');

  useEffect(
    () => {
      socket.auth = {
        _id: profile._id,
      };
      socket.connect();
      socket.on('receive_message', data => {
      console.log("🚀 ~ Chat ~ data:", data)
        const {payload} = data 
        setConversations(conversations => [
          ...conversations,
          payload
        ]);
      });
      return () => {
        socket.disconnect();
      };
    },
    [profile._id],
  );

  useEffect(()=>{
    // if(!receiver) return
    axios.get(`/conversations/receiver/${receiver || profile._id}`,{
      baseURL: import.meta.env.VITE_API_URL,
      headers : {
        Authorization : 'Bearer ' + localStorage.getItem('access_token')
      },
      params:{
        limit : 10 , 
        page : 1
      }
    }).then(response=>{
      console.log("🚀 ~ useEffect ~ response:", response)
      setConversations(response.data.data)
    })
  },[receiver , profile._id])

  const handleSubmit = e => {
    e.preventDefault();
    if (!value.trim()) return;
 

    const conversation = {
      content: value,
      sender_id: profile._id,
      receiver_id: receiver, 
    }
    socket.emit('send_message', {
      payload: conversation
    });
    setConversations(conversations => [
      ...conversations,
      {
      ...conversation,
      _id : new Date().getTime().toString()
      },
    ]);

    setValue('');
  };

  const getProfile = (username)=>{
    axios.get(`/users/${username}`,{
      baseURL: import.meta.env.VITE_API_URL,
    }).then((response)=> {
      console.log("🚀 ~ getProfile ~ response:", response.data._id)
      setReceiver(response.data?._id ?? '')
    })
  }

  return (
    <div>
        <div className='flex justify-center'>
        {usernames.map(username => {
          return (
            <button key={username.name}  onClick={() => getProfile(username.value)} className='bg-black text-white flex-wrap m-2 hover:opacity-80'>
              {username.name}  {profile.username === username.value ? '- You' : ''}
            </button>
          );
        })}
          </div>
      <div className="flex flex-col h-[400px] max-w-md mx-auto border border-gray-200 shadow-lg rounded-lg">
        <div className="text-center text-white bg-red-600 p-4 font-bold">
          <div>
            id : {profile._id}
          </div>
          <div>
            email : {profile.email}
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 bg-gray-50 ">
          {conversations.map((message, index) =>
            <div
              key={index}
              className={`flex mb-4 ${message.sender_id === profile._id
                ? 'justify-end'
                : 'justify-start'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${message.sender_id === profile._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'}`}
              >
                <p className="text-sm">
                  {message.content}
                </p>
              </div>
            </div>,
          )}
        </div>
        <form
          className="flex justify-between items-center p-4 bg-white border-t border-gray-300"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 flex-grow mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
