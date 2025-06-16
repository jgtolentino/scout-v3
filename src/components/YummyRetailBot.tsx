import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, Package, MapPin, Star, AlertTriangle } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';
import { yummyApi, yummyHelpers } from '../services/yummy';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  agent?: 'yummy' | 'scout';
}

interface YummyRetailBotProps {
  className?: string;
}

const yummyPromptExamples = [
  {
    icon: <Package className="w-4 h-4" />,
    title: "Inventory Intelligence",
    prompt: "Which FMCG products are critically low on stock?"
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    title: "Promotion Analysis",
    prompt: "Show me the ROI of our recent beverage promotions"
  },
  {
    icon: <AlertTriangle className="w-4 h-4" />,
    title: "Competitor Intelligence",
    prompt: "What are the biggest competitive threats in the snacks category?"
  },
  {
    icon: <Star className="w-4 h-4" />,
    title: "TBWA Portfolio",
    prompt: "How are Oishi, Del Monte, and Champion performing vs competitors?"
  }
];

const retailPromptExamples = [
  {
    icon: <TrendingUp className="w-4 h-4" />,
    title: "Revenue Analysis",
    prompt: "What are this week's top-selling FMCG brands in NCR?"
  },
  {
    icon: <Package className="w-4 h-4" />,
    title: "Product Performance",
    prompt: "Show me revenue trend of Oishi products in Metro Manila"
  },
  {
    icon: <MapPin className="w-4 h-4" />,
    title: "Regional Insights",
    prompt: "Compare Visayas vs Mindanao performance this month"
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Recommendations",
    prompt: "Give 3 actions to improve sales in CALABARZON region"
  }
];

export const YummyRetailBot: React.FC<YummyRetailBotProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🏪 Hi! I'm **Yummy**, your FMCG Intelligence Agent, integrated with Scout RetailBot.

**🧠 Yummy Capabilities:**
• **📦 Inventory Intelligence** - Real-time stock monitoring & alerts
• **💸 Promotion Analytics** - Campaign ROI & effectiveness tracking  
• **🆚 Competitor Intelligence** - Market share & threat analysis
• **🎯 Category Optimization** - FMCG-wide performance insights

**🤖 Scout Capabilities:**
• **📊 Revenue Analysis** - Cross-regional performance trends
• **👥 Consumer Insights** - Demographics & behavioral patterns
• **🌍 Regional Intelligence** - 17 provinces, city-level insights

Choose your assistant mode or ask any question - I'll route to the right agent!`,
      timestamp: new Date(),
      agent: 'yummy'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'yummy' | 'scout'>('yummy');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { filters } = useFilterStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectAgentFromQuery = (query: string): 'yummy' | 'scout' => {
    const yummyKeywords = [
      'inventory', 'stock', 'promotion', 'campaign', 'roi', 'competitor', 'threat',
      'market share', 'effectiveness', 'yummy', 'fmcg intelligence'
    ];
    
    const scoutKeywords = [
      'revenue', 'sales', 'trend', 'regional', 'demographic', 'consumer', 
      'behavior', 'scout', 'analytics'
    ];

    const queryLower = query.toLowerCase();
    
    const yummyScore = yummyKeywords.reduce((score, keyword) => 
      queryLower.includes(keyword) ? score + 1 : score, 0
    );
    
    const scoutScore = scoutKeywords.reduce((score, keyword) => 
      queryLower.includes(keyword) ? score + 1 : score, 0
    );

    return yummyScore > scoutScore ? 'yummy' : 'scout';
  };

  const generateYummyResponse = async (query: string): Promise<string> => {
    try {
      // Analyze query intent for Yummy capabilities
      const queryLower = query.toLowerCase();
      
      if (queryLower.includes('inventory') || queryLower.includes('stock')) {
        const inventoryData = await yummyApi.getInventory();
        const lowStockItems = inventoryData.filter(item => item.current_stock <= item.reorder_point);
        
        if (lowStockItems.length > 0) {
          const alerts = lowStockItems.map(item => yummyHelpers.formatInventoryAlert(item)).join('\n');
          return `📦 **Inventory Intelligence Alert**\n\n${alerts}\n\n💡 **Recommendation:** Consider immediate restocking for critical items to avoid stockouts.`;
        } else {
          return `📦 **Inventory Status:** All monitored SKUs are currently at healthy stock levels. No immediate action required.`;
        }
      }
      
      if (queryLower.includes('promotion') || queryLower.includes('campaign') || queryLower.includes('roi')) {
        const promotionData = await yummyApi.getPromotions();
        const topPromos = promotionData
          .filter(p => p.roi > 0)
          .sort((a, b) => b.roi - a.roi)
          .slice(0, 3);
          
        if (topPromos.length > 0) {
          const promoAnalysis = topPromos.map(promo => 
            yummyHelpers.formatPromotionEffectiveness(promo)
          ).join('\n');
          return `💸 **Promotion Performance Analysis**\n\n${promoAnalysis}\n\n📈 **Insight:** Top-performing campaigns show strong ROI. Consider scaling successful strategies.`;
        } else {
          return `💸 **Promotion Analysis:** Current campaign data shows mixed results. Recommend reviewing targeting and messaging strategies.`;
        }
      }
      
      if (queryLower.includes('competitor') || queryLower.includes('threat') || queryLower.includes('market share')) {
        const competitorData = await yummyApi.getCompetitors();
        const highThreats = competitorData.filter(comp => comp.threat_level === 'high');
        
        if (highThreats.length > 0) {
          const threats = highThreats.map(comp => 
            yummyHelpers.formatCompetitorThreat(comp)
          ).join('\n');
          return `🆚 **Competitive Intelligence Alert**\n\n${threats}\n\n⚡ **Strategic Response:** Monitor pricing strategies and consider defensive promotional activities.`;
        } else {
          return `🆚 **Competitive Landscape:** No immediate high-threat competitors detected. Market position appears stable.`;
        }
      }

      // TBWA brand specific queries
      if (queryLower.includes('oishi') || queryLower.includes('del monte') || queryLower.includes('champion')) {
        const brandAnalysis = await yummyApi.getBenchmarks();
        return `🏆 **TBWA Portfolio Performance**\n\n📊 Our key brands (Oishi, Del Monte, Champion) maintain strong market positions. \n\n💡 **Recommendation:** Continue focusing on premium positioning and quality messaging to differentiate from value competitors.`;
      }

      // General FMCG insights
      const insights = await yummyApi.getInsights();
      if (insights.length > 0) {
        const topInsight = insights[0];
        return `🧠 **FMCG Intelligence Insight**\n\n**${topInsight.category}:** ${topInsight.trend}\n\n💡 **Recommendation:** ${topInsight.recommendation}\n\n**Confidence:** ${topInsight.confidence}%`;
      }

      return `🏪 **Yummy Analysis:** I've analyzed your query across inventory, promotions, and competitive intelligence. For specific insights, try asking about stock levels, campaign performance, or competitor threats.`;
      
    } catch (error) {
      console.error('Yummy API Error:', error);
      return `⚠️ **Yummy Intelligence:** Currently unable to access live FMCG data. Please try again or contact support if the issue persists.`;
    }
  };

  const generateScoutResponse = async (query: string): Promise<string> => {
    // Fallback to existing RetailBot logic for Scout responses
    const contextInfo = `Current filters: ${JSON.stringify(filters)}`;
    
    try {
      const response = await fetch('/api/retail-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query,
          context: contextInfo,
          agent: 'scout'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      // Fallback pattern-matched responses
      return `📊 **Scout Analysis:** Based on your query about "${query}", I recommend checking the dashboard for current metrics. Use the filter system to narrow down to specific regions or time periods for more targeted insights.`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Detect which agent should handle the query
    const detectedAgent = detectAgentFromQuery(input);
    
    try {
      let response: string;
      
      if (detectedAgent === 'yummy') {
        response = await generateYummyResponse(input);
      } else {
        response = await generateScoutResponse(input);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        agent: detectedAgent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ I encountered an error processing your request. Please try again or rephrase your question.`,
        timestamp: new Date(),
        agent: activeAgent
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl border border-gray-200 ${className}`}>
      {/* Header with Agent Selector */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-accent text-white rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Yummy × Scout Intelligence</h3>
            <p className="text-sm text-blue-100">FMCG & Retail Analytics Agent</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveAgent('yummy')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              activeAgent === 'yummy' 
                ? 'bg-white text-primary' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            🏪 Yummy
          </button>
          <button
            onClick={() => setActiveAgent('scout')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              activeAgent === 'scout' 
                ? 'bg-white text-primary' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📊 Scout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : message.agent === 'yummy'
                  ? 'bg-gradient-to-r from-accent/10 to-accent/20 text-gray-800 border border-accent/30'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    message.agent === 'yummy' ? 'bg-accent text-white' : 'bg-primary text-white'
                  }`}>
                    {message.agent === 'yummy' ? '🏪' : '📊'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.agent && ` • ${message.agent === 'yummy' ? 'Yummy Intelligence' : 'Scout Analytics'}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="text-sm">
                  <span className="animate-pulse">Analyzing with {activeAgent === 'yummy' ? 'Yummy Intelligence' : 'Scout Analytics'}...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {activeAgent === 'yummy' ? '🏪 Yummy Intelligence Examples:' : '📊 Scout Analytics Examples:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(activeAgent === 'yummy' ? yummyPromptExamples : retailPromptExamples).map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example.prompt)}
                  className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="text-primary">{example.icon}</div>
                    <span className="text-sm font-medium text-gray-900">{example.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{example.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Ask ${activeAgent === 'yummy' ? 'Yummy about inventory, promotions, or competitors' : 'Scout about revenue, trends, or demographics'}...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};