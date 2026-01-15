
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600 ml-3' : 'bg-slate-700 mr-3'}`}>
          <i className={`fas ${isUser ? 'fa-user' : 'fa-robot text-white'} text-white`}></i>
        </div>
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`p-4 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
          }`}>
            {message.image && (
              <img 
                src={message.image} 
                alt="Uploaded attachment" 
                className="max-w-full h-auto rounded-lg mb-3 border border-slate-200" 
              />
            )}
            <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {message.text}
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
