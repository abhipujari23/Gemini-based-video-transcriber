import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { sendMessageToChat } from '../services/geminiService';
import { generateId } from '../services/utils';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your Gemini 3 Pro assistant. How can I help you today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Filter out error messages from history before sending to API to avoid confusion
      const history = messages.filter(m => !m.isError);
      const responseText = await sendMessageToChat(userMsg.text, history);
      
      const botMsg: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'model',
        text: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
              ${msg.role === 'user' ? 'bg-blue-600' : msg.isError ? 'bg-red-500' : 'bg-emerald-600'}
            `}>
              {msg.role === 'user' ? <User size={20} /> : msg.isError ? <AlertCircle size={20} /> : <Bot size={20} />}
            </div>
            
            <div className={`
              max-w-[80%] rounded-2xl p-4 shadow-sm
              ${msg.role === 'user' 
                ? 'bg-blue-600/10 border border-blue-600/20 text-slate-100 rounded-tr-none' 
                : msg.isError
                  ? 'bg-red-900/20 border border-red-500/30 text-red-200'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
              }
            `}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className="mt-1 text-xs opacity-50">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-4">
             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
               <Bot size={20} />
             </div>
             <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-800 rounded-xl border border-slate-700 p-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini 3 Pro anything..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 border-none focus:ring-0 resize-none max-h-32 py-3 px-2 custom-scrollbar"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-lg mb-0.5 transition-all ${
              input.trim() && !isTyping 
                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-xs text-slate-500">
             Gemini may display inaccurate info, including about people, so double-check its responses.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;