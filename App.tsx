
import React, { useState, useRef, useEffect } from 'react';
import { Message, Topic } from './types';
import { TOPICS } from './constants';
import { getGeminiResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Tôi đã phân tích xong bộ Quiz Vi xử lý của bạn! \n\nTôi thấy có một số phần dễ gây nhầm lẫn như: hiệu chỉnh cộng BCD, tính toán số bù 2 (câu 7 bạn đã nhầm giữa -16 và +16), và quy trình nạp lệnh vào IR. \n\nBạn muốn tôi giải thích chi tiết câu nào trong ảnh trên hoặc cần làm thêm bài tập tương tự không?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'topics'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        parts: m.text
      }));

      const aiResponseText = await getGeminiResponse(userMessage.text, userMessage.image, history);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in conversation flow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex flex-col w-80 bg-slate-900 text-white border-r border-slate-800">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center border-2 border-indigo-400/30">
              <i className="fas fa-microchip text-xl"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight">MicroMentor <span className="text-indigo-400">Pro</span></h1>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800'}`}
            >
              <i className="fas fa-brain"></i>
              <span>Giải Quiz & Sửa lỗi</span>
            </button>
            <button 
              onClick={() => setActiveTab('topics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'topics' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800'}`}
            >
              <i className="fas fa-graduation-cap"></i>
              <span>Ôn tập lý thuyết</span>
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 bg-slate-950/50">
          <div className="text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">Phân tích Quiz gần đây</div>
          <div className="space-y-3">
            {TOPICS.map(topic => (
              <div key={topic.id} className="group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                    <i className={`fas ${topic.icon} text-[10px]`}></i>
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{topic.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="md:hidden w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <i className="fas fa-microchip text-white text-xs"></i>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 italic">BK Micro-Expert AI</h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Đã nạp kiến thức từ Quiz BKEL</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
          {activeTab === 'chat' ? (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {TOPICS.map(topic => (
                <div key={topic.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all text-indigo-600">
                    <i className={`fas ${topic.icon} text-xl`}></i>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{topic.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{topic.description}</p>
                  <button 
                    onClick={() => {
                      setInputText(`Hãy giải bài tập về ${topic.title} tương tự như trong Quiz tôi vừa gửi.`);
                      setActiveTab('chat');
                    }}
                    className="mt-4 text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center space-x-2 group-hover:translate-x-2 transition-transform"
                  >
                    <span>Luyện tập</span>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <footer className="p-4 md:p-6 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto relative">
            {selectedImage && (
              <div className="absolute bottom-full left-0 mb-4 p-2 bg-white rounded-xl shadow-2xl border border-indigo-100 flex items-center animate-in fade-in zoom-in duration-300">
                <div className="relative">
                  <img src={selectedImage} alt="Preview" className="h-24 w-auto rounded-lg object-cover border border-slate-200" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <i className="fas fa-times text-[10px]"></i>
                  </button>
                </div>
                <div className="ml-4 pr-4">
                  <p className="text-xs font-bold text-slate-700">Quiz Image Detected</p>
                  <p className="text-[10px] text-slate-400">Sẵn sàng phân tích lỗi sai...</p>
                </div>
              </div>
            )}
            
            <div className="flex items-end space-x-2 md:space-x-4 bg-slate-50 border border-slate-200 p-2 rounded-2xl focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all shadow-inner">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Tải ảnh Quiz"
              >
                <i className="fas fa-camera-retro text-xl"></i>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Câu 7 tại sao lại ra -16? Giải thích cộng BCD..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-3 text-slate-700 placeholder:text-slate-400 text-sm md:text-base"
                rows={1}
                style={{ height: 'auto', minHeight: '44px' }}
              />
              
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                className={`p-3 rounded-xl transition-all flex items-center justify-center w-11 h-11 ${
                  isLoading || (!inputText.trim() && !selectedImage)
                    ? 'bg-slate-200 text-slate-400' 
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-location-arrow"></i>
                )}
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
