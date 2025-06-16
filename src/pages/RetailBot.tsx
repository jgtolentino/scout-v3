import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Lightbulb, TrendingUp, Package, Users } from 'lucide-react';
import { useTransactionData } from '../hooks/useTransactionData';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const RetailBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { kpiData } = useTransactionData();

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `👋 Hello! I'm RetailBot, your AI retail analytics assistant.

I have access to your live FMCG dataset with:
• ₱${kpiData?.totalRevenue?.toLocaleString() || '1,213,902'} in total revenue
• ${kpiData?.totalTransactions?.toLocaleString() || '5,000'} transactions analyzed
• ${kpiData?.uniqueCustomers || '995'} unique customers
• 72 FMCG brands across 17 Philippine regions

I can help you with:
📊 **Data Insights** - Ask about trends, patterns, or specific metrics
🎯 **Recommendations** - Get actionable business suggestions
🔍 **Deep Analysis** - Drill down into specific categories or regions
📈 **Performance** - Compare brands, periods, or customer segments

What would you like to explore today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [kpiData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Enhanced context with current KPI data
      const contextData = {
        revenue: kpiData?.totalRevenue || 1213902,
        transactions: kpiData?.totalTransactions || 5000,
        customers: kpiData?.uniqueCustomers || 995,
        avgOrderValue: kpiData?.avgOrderValue || 242.78,
        topCategories: kpiData?.topCategories || [],
        recentTrends: 'Strong FMCG performance with 24-26% gross margin'
      };

      const response = await fetch('/api/ai/retail-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          context: contextData,
          systemPrompt: `You are RetailBot, an expert retail analytics AI assistant. 
            You have access to live FMCG transaction data for Philippine retail analytics.
            
            Current dataset context:
            - Revenue: ₱${contextData.revenue.toLocaleString()}
            - Transactions: ${contextData.transactions.toLocaleString()}
            - Customers: ${contextData.customers.toLocaleString()}
            - AOV: ₱${contextData.avgOrderValue}
            
            Always provide:
            1. Data-driven insights based on actual metrics
            2. Actionable recommendations for retail optimization
            3. Clear explanations with specific numbers when relevant
            4. Cultural context for Philippine FMCG market when applicable
            
            Be concise, professional, and focus on business value.`
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('RetailBot error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to my analytics engine. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: TrendingUp,
      label: "Revenue Trends",
      query: "What are the current revenue trends and what's driving them?"
    },
    {
      icon: Package,
      label: "Top Products",
      query: "Which product categories are performing best and why?"
    },
    {
      icon: Users,
      label: "Customer Insights",
      query: "What insights can you share about our customer behavior patterns?"
    },
    {
      icon: Lightbulb,
      label: "Recommendations",
      query: "What are your top 3 recommendations to improve our retail performance?"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Bot className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">RetailBot AI Assistant</h1>
            <p className="text-blue-100">Your intelligent retail analytics companion</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInput(action.query)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <action.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    <div className={`text-xs mt-2 opacity-70`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">RetailBot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your retail data..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailBot;