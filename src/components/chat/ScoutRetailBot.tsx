import React, { useState } from 'react';
import { clsx as cls } from 'clsx';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ScoutRetailBot() {
  const [history, setHistory] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m Scout, your retail intelligence assistant. I can help you analyze FMCG trends, customer insights, and store performance data. What would you like to know?'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual Azure OpenAI call)
      setTimeout(() => {
        setHistory(prev => [...prev, {
          role: 'assistant',
          content: `Based on your query about "${userMessage}", I can see some interesting patterns in your FMCG data. Let me analyze the latest trends for you...`
        }]);
        setIsLoading(false);
      }, 1500);
    } catch {
      setHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.'
      }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg flex flex-col h-[32rem] w-80 bg-white">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/assets/cookie-bot.svg" 
            alt="Scout Bot" 
            className="h-6 w-6"
          />
          <span className="font-medium">Scout Retail Bot</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((m, i) => (
          <div key={i} className={cls(
            'flex items-start gap-2',
            m.role === 'user' ? 'justify-end' : 'justify-start'
          )}>
            {m.role !== 'user' && (
              <img
                src="/assets/cookie-bot.svg"
                alt="Scout Cookie Bot"
                className="h-6 w-6 shrink-0"
              />
            )}
            <div className={cls(
              'whitespace-pre-wrap text-sm rounded-lg px-3 py-2 max-w-xs',
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800'
            )}>{m.content}</div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-2">
            <img
              src="/assets/cookie-bot.svg"
              alt="Scout Cookie Bot"
              className="h-6 w-6 shrink-0"
            />
            <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about sales trends, customer insights..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}