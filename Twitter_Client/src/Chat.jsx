import { useEffect, useState } from 'react';
import socket from './socket';

export default function Chat() {
  const profile = JSON.parse(localStorage.getItem('profile')) || {};
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState([]); 

  useEffect(
    () => {
      socket.auth = {
        _id: profile._id,
      };
      socket.connect();
      socket.on('receive private message', data => {
        const content = data.content;
        setMessages(messages => [
          ...messages,
          {
            content,
            isSender: false,
          },
        ]);
      });
      return () => {
        socket.disconnect();
      };
    },
    [profile._id],
  );

  const handleSubmit = e => {
    e.preventDefault();
    if (!value.trim()) return;

    socket.emit('receive private message', {
      content: value,
      to: '6767de0fcfaa49fdfe78ce38',
    });
    setMessages(messages => [
      ...messages,
      {
        content: value,
        isSender: true,
      },
    ]);

    setValue('');
  };

  return (
    <div className="flex flex-col h-[400px] max-w-md mx-auto border border-gray-200 shadow-lg rounded-lg">
      <div className="text-center text-white bg-red-600 p-4 font-bold">
        <div>
          id : {profile._id}
        </div>
        <div>
          email : {profile.email}
        </div>
        <div>
          socket_id : {socket.id}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 ">
        {messages.map((message, index) =>
          <div
            key={index}
            className={`flex mb-4 ${message.isSender
              ? 'justify-end'
              : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[80%] ${message.isSender
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
  );
}
