import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { getRecentEntries } from '../services/storageService';
import { createCoachChat, sendMessageToCoach } from '../services/geminiService';
import { Chat } from "@google/genai";

interface AICoachProps {
  user: User;
}

export const AICoach: React.FC<AICoachProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initChat = async () => {
    setIsLoading(true);
    setError(null);
    setMessages([]); // Clear previous error messages if any
    try {
      const recentLogs = getRecentEntries(5);
      // Pass user name for personalization
      const chat = await createCoachChat(recentLogs, user.name);
      setChatSession(chat);
      
      // Initial greeting personalized with first name
      const firstName = user.name.split(' ')[0];
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: `Hi ${firstName}! I'm your FocusMate Coach. I've reviewed your recent progress. How can I support your study goals today?`,
        timestamp: Date.now()
      }]);
    } catch (e: any) {
      console.error("Failed to start chat", e);
      const errorMessage = e.message || "Unknown error";
      
      let displayError = "I'm having trouble connecting right now. Please check your connection or API settings.";
      if (errorMessage.includes("API Key")) {
         displayError = "API Key is missing. Please add your Google Gemini API Key to the environment variables.";
      }
      
      setError(displayError);
      
      setMessages([{
        id: 'error',
        role: 'model',
        text: displayError,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initChat();
  }, [user.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSession || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToCoach(chatSession, userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          AI Coach
        </h2>
        <p className="text-slate-500 text-sm">Chat about your progress, study tips, or motivation.</p>
        {error && (
          <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
            {!error.includes("API Key") && (
              <button 
                onClick={initChat} 
                className="px-3 py-1 bg-white border border-red-200 rounded-lg hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-indigo-600 text-white'
              }`}>
                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-500/10' 
                  : (msg.id === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-white text-slate-700 border border-slate-200') + ' rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice..."
              disabled={isLoading || !chatSession}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm disabled:opacity-50 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !chatSession}
              className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};