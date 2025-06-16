import React, { useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import { getDataProvider } from '../lib/dataProvider';

export default function LearnPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/ai/retail-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          systemPrompt: `You are **Scout LearnBot**, an interactive tutor for the Scout Analytics dashboard. 
            On first load, introduce yourself and explain that the dashboard is powered by a 
            **5,000-transaction FMCG dataset** spanning 17 Philippine regions, 72 brands, and 
            ₱1,213,902.44 in total revenue.
            
            Offer the user tips like:
            • How to change filters (date range, regions, brands)
            • How KPI cards recalculate in real-time
            • Where to find product-mix insights
            • How to use the AI assistant for deeper analysis
            
            Then wait for questions. Always answer concisely and cite metric values from the 
            current snapshot when relevant. Be friendly and helpful!`
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Tutorial</h1>
        <p className="text-gray-600">Learn how to use Scout Analytics effectively with our AI tutor</p>
      </div>
      
      <ChatPanel
        messages={messages}
        onSendMessage={sendMessage}
        loading={loading}
        variant="learn"
        initialMessage="👋 Hello! I'm Scout LearnBot, your interactive guide to the Scout Analytics dashboard. 

This dashboard is powered by a **comprehensive 5,000-transaction FMCG dataset** that includes:
• ₱1,213,902.44 in total revenue
• 17 Philippine regions covered
• 72 FMCG brands tracked
• Real-time KPI calculations

What would you like to learn about? I can help you with:
📊 Understanding the KPI cards and metrics
🔍 Using filters to slice data by region, brand, or date
📈 Navigating between different dashboard pages
🤖 Getting the most from the AI assistant

Just ask me anything!"
      />
    </div>
  );
}