import { useEffect, useState } from 'react';
import socket from './socket';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';

const LIMIT = 10
const PAGE = 1 
export default function Chat() {
  const profile = JSON.parse(localStorage.getItem('profile')) || {};
  const usernames = [{
    name : 'user1',
    value : 'trongdn2405+15860',
    _id : '676b8ec893e2cbf319daf5a3'
  },
  {
    name : 'user2',
    value : 'trongdn2405+29157',
    _id : '676b8eeb93e2cbf319daf5a7'
  }
];
  const [value, setValue] = useState('');
  const [conversations, setConversations] = useState([]); // dùng để render message
  console.log("🚀 ~ Chat ~ conversations:", conversations)
  const [receiver , setReceiver] = useState(profile._id);
  const [pagination , setPagination] = useState({
    page : PAGE,
    total_page : 0
  });


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
      {
        ...conversation,
        _id : new Date().getTime().toString()
        },
      ...conversations,
    ])

    setValue('')
  }

  const getProfile = (username)=>{
    axios.get(`/users/${username}`,{
      baseURL: import.meta.env.VITE_API_URL,
    }).then((response)=> {
      console.log("🚀 ~ getProfile ~ response:", response.data._id)
      setReceiver(response.data?._id ?? '')
    })
  }

  useEffect(
    () => {
      socket.auth = {
        _id: profile._id,
      };
      socket.connect();
      socket.on('receive_message', data => {
      console.log("🚀 ~ Chat ~ data:", data)
        const {payload} = data 
        setConversations(conversations => [payload, ...conversations])
      });
      return () => {
        socket.disconnect();
      };
    },
    [profile._id],
  );

  useEffect(()=>{
    if(receiver){ // receiver là id 
      // if(!receiver) return
    axios.get(`/conversations/receiver/${receiver}`,{
      baseURL: import.meta.env.VITE_API_URL,
      headers : {
        Authorization : 'Bearer ' + localStorage.getItem('access_token')
      },
      params:{
        limit : LIMIT , 
        page : PAGE
      }
    }).then(response=>{
      console.log(response.data);
      
      const {data : conversations , page , total} = response.data
      console.log("🚀 ~ useEffect ~ conversations:", conversations , page ,total)
      
      setConversations(conversations)
      setPagination({
        page , total_page: total
      })
    })
    }
  },[receiver , profile._id])

  const fetchMoreConversations = () => {
    if(receiver && pagination.page < pagination.total_page) {
      axios.get(`/conversations/receiver/${receiver}`,{
        baseURL: import.meta.env.VITE_API_URL,
        headers : {
          Authorization : 'Bearer ' + localStorage.getItem('access_token')
        },
        params:{
          limit : LIMIT , 
          page : pagination.page + 1
        }
      }).then(response=>{
        const {data : conversations , page , total} = response.data
        setConversations(prev => [...prev, ...conversations]); // Dữ liệu mới nằm ở cuối
        setPagination({
          page,
          total_page : total
        })
      })
    }
  }

  return (
    <div>
    <div className='flex justify-center'>
      {usernames.map((username) => {
        return (
          <button
            key={username.name}
            onClick={() => getProfile(username.value)}
            className={`bg-black text-white flex-wrap m-2 hover:opacity-80 ${receiver === username._id ? 'bg-blue-500' : ''}`}
          >
            {username.name} {profile.username === username.value ? '- You' : ''}
          </button>
        );
      })}
    </div>
    <div className="flex flex-col h-[500px] max-w-md mx-auto border border-gray-200 shadow-lg rounded-lg">
      <div className="text-center text-white bg-red-600 p-4 font-bold">
        <div>id : {profile._id}</div>
        <div>email : {profile.email}</div>
      </div>
      <div
        id="scrollableDiv"
        style={{
          height: "calc(100% - 120px)", // Trừ đi chiều cao header và input form
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {/* Nội dung cuộn */}
        <InfiniteScroll
          dataLength={conversations.length}
          next={fetchMoreConversations}
          style={{
            display: "flex",
            flexDirection: "column-reverse",
          }}
          inverse={true}
          hasMore={pagination.page < pagination.total_page}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
        >
          {conversations.map((message, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                message.sender_id === profile._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender_id === profile._id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <form
        className="flex justify-between items-center p-4 bg-white border-t border-gray-300"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={value}
          disabled={receiver === profile._id}
          onChange={(e) => setValue(e.target.value)}
          className={` ${receiver === profile._id ? 'bg-gray-700' : ''} border border-gray-300 rounded-lg py-2 px-4 flex-grow mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={receiver === profile._id}
          className={`${receiver === profile._id ? 'bg-gray-700' : ''} bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}
        >
          Send
        </button>
      </form>
    </div>
  </div>
  
  );
}
