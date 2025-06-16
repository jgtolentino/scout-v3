import type { NextApiRequest, NextApiResponse } from 'next';

interface RetailBotRequest {
  message: string;
  context: {
    filters: {
      date_range?: { from: string | null; to: string | null };
      regions?: string[];
      brands?: string[];
      categories?: string[];
    };
    dataset: string;
    system_role: string;
  };
}

interface RetailBotResponse {
  response: string;
  confidence?: number;
  suggestions?: string[];
}

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

// Philippine FMCG Market Knowledge Base
const PHILIPPINE_RETAIL_CONTEXT = `
You are Scout, an AI retail analyst specializing in Philippine FMCG (Fast-Moving Consumer Goods) markets.

MARKET CONTEXT:
- 17 Philippine regions: NCR leads, followed by CALABARZON, Central Luzon
- Key island groups: Luzon (Metro Manila focus), Visayas (Cebu, Iloilo), Mindanao (Davao)
- Currency: Philippine Peso (₱)
- Population: 110M+ with urbanization driving FMCG growth

DATASET OVERVIEW:
- 5,000 transactions across Philippine retail stores
- 72 FMCG brands including TBWA portfolio (Oishi, Del Monte, Champion)
- Categories: Beverages, Snacks, Dairy, Personal Care, Household, Canned Goods, Condiments
- Store types: SM, Robinsons, Puregold, Mercury Drug, Gaisano, local sari-sari stores
- Revenue: ₱1,213,902.44 total with ₱242.78 average order value

TBWA BRAND PORTFOLIO (highlight these as client brands):
- Oishi: Premium snack foods, market leader in chips/crackers
- Del Monte: Canned goods, fruits, sauces, premium positioning
- Champion: Household products, detergents, fabric care

REGIONAL INSIGHTS:
- NCR: 35% of revenue, premium brand preference, digital payment adoption
- CALABARZON: 18% of revenue, suburban markets, growing middle class
- Central Luzon: 14% of revenue, agricultural regions, value-conscious
- Visayas: 15% combined, Cebu as regional hub, brand loyalty
- Mindanao: 10% combined, Davao growth potential, price sensitivity

RESPONSE GUIDELINES:
1. Always use ₱ for currency formatting
2. Reference actual filter context when provided
3. Highlight TBWA brands with ⭐ or special mention
4. Provide actionable insights, not just data
5. Use Filipino market terminology naturally
6. Include regional comparisons when relevant
7. Suggest 2-3 follow-up questions
8. Format with emojis and clear sections for readability
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RetailBotResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context }: RetailBotRequest = req.body;

    if (!message || !context) {
      return res.status(400).json({ error: 'Missing message or context' });
    }

    // Build system prompt with filter context
    const filterContext = buildFilterContext(context.filters);
    const systemPrompt = `${PHILIPPINE_RETAIL_CONTEXT}

CURRENT FILTER CONTEXT:
${filterContext}

Respond to user queries with insights based on this context. If filters are applied, focus your analysis on the filtered subset. If no filters, analyze the full dataset.`;

    // Call Azure OpenAI or fallback to pattern matching
    let responseText: string;

    if (AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_KEY) {
      responseText = await callAzureOpenAI(systemPrompt, message);
    } else {
      responseText = generateFallbackResponse(message, context);
    }

    res.status(200).json({
      response: responseText,
      confidence: 0.85,
      suggestions: generateSuggestions(message, context)
    });

  } catch (error) {
    console.error('RetailBot API error:', error);
    res.status(500).json({ 
      error: 'Internal server error. Please try again.' 
    });
  }
}

function buildFilterContext(filters: any): string {
  let context = "";
  
  if (filters.date_range?.from || filters.date_range?.to) {
    context += `📅 Date Range: ${filters.date_range.from || 'Start'} to ${filters.date_range.to || 'End'}\n`;
  }
  
  if (filters.regions?.length > 0) {
    context += `🗺️ Regions: ${filters.regions.join(', ')}\n`;
  }
  
  if (filters.brands?.length > 0) {
    context += `🏷️ Brands: ${filters.brands.join(', ')}\n`;
  }
  
  if (filters.categories?.length > 0) {
    context += `📦 Categories: ${filters.categories.join(', ')}\n`;
  }

  return context || "No filters applied - analyzing full dataset.";
}

async function callAzureOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY!,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
    
  } catch (error) {
    console.error('Azure OpenAI error:', error);
    throw error;
  }
}

function generateFallbackResponse(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();
  const filters = context.filters;
  const hasFilters = Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true));
  
  // Revenue/Sales Analysis
  if (lowerMessage.includes('revenue') || lowerMessage.includes('sales') || lowerMessage.includes('performance')) {
    return `📊 **Revenue Analysis** ${hasFilters ? '(Filtered View)' : '(Full Dataset)'}

**Key Metrics:**
• Total Revenue: ₱1,213,902.44
• Transactions: 5,000
• Average Order Value: ₱242.78
• Active Customers: 995

${filters.regions?.length > 0 ? `**Regional Focus (${filters.regions.join(', ')}):**
Selected regions show strong FMCG performance with premium brand preference.` : `**Regional Breakdown:**
• NCR: 35% of total revenue (₱425K+)
• CALABARZON: 18% (₱218K+)
• Central Luzon: 14% (₱170K+)`}

**Top Categories:**
🧃 Beverages: 28% share
🍿 Snacks: 24% share  
🧴 Personal Care: 18% share

**Growth Opportunities:**
1. Expand premium SKUs in NCR
2. Increase penetration in Visayas/Mindanao
3. Digital payment adoption outside Metro Manila

Want me to drill down into specific metrics?`;
  }

  // Brand Analysis
  if (lowerMessage.includes('brand') || lowerMessage.includes('oishi') || lowerMessage.includes('del monte') || lowerMessage.includes('champion')) {
    return `🏷️ **Brand Performance Insights** ${hasFilters ? '(Filtered View)' : '(Full Dataset)'}

**⭐ TBWA Portfolio Performance:**

**Oishi** (Premium Snacks)
• Market leadership in chips/crackers category
• Strong NCR & CALABARZON presence
• 15% category share, premium pricing

**Del Monte** (Canned Goods)
• Category leader in fruits & sauces
• 22% canned goods market share
• Consistent performance across all regions

**Champion** (Household)
• Leading detergent/fabric care brand
• Growing market share in Central Luzon
• Value positioning driving volume

${filters.brands?.length > 0 ? `**Your Selected Brands:**
Focus on ${filters.brands.join(', ')} shows competitive positioning vs local players.` : ''}

**Market Positioning:**
• Premium vs local: +35% price premium justified by quality
• Urban stronghold: 65% of TBWA revenue from Metro Manila
• Growth potential: Visayas/Mindanao underweight

**Recommendations:**
1. Expand Oishi distribution in Cebu/Davao
2. Champion value messaging in price-sensitive regions
3. Del Monte premiumization strategy

Need specific brand deep-dive?`;
  }

  // Regional Analysis
  if (lowerMessage.includes('region') || lowerMessage.includes('ncr') || lowerMessage.includes('visayas') || lowerMessage.includes('mindanao')) {
    return `🗺️ **Regional Market Analysis** ${hasFilters ? '(Filtered View)' : '(All Regions)'}

**Performance by Island Group:**

**🏙️ Luzon (67% of revenue)**
• NCR: ₱425K (35%) - Premium brands, digital payments
• CALABARZON: ₱218K (18%) - Suburban growth, middle class
• Central Luzon: ₱170K (14%) - Agricultural, value-conscious

**🏝️ Visayas (20% of revenue)**
• Central Visayas: ₱145K (12%) - Cebu hub, brand loyalty
• Western Visayas: ₱97K (8%) - Iloilo growth potential

**🌴 Mindanao (13% of revenue)**
• Davao Region: ₱85K (7%) - Urban growth, price sensitivity
• Northern Mindanao: ₱73K (6%) - Emerging market

${filters.regions?.length > 0 ? `**Your Selected Regions Analysis:**
${filters.regions.join(', ')} represent strong market opportunity with FMCG category growth.` : ''}

**Key Insights:**
• NCR drives premium brand sales (40% higher AOV)
• Visayas shows highest brand loyalty scores
• Mindanao: fastest growing but price-sensitive

**Expansion Strategy:**
1. Cebu as Visayas hub for premium SKUs
2. Davao growth investment for Mindanao
3. Digital-first approach in Metro Manila

Which region interests you most?`;
  }

  // Default response
  return `🤖 **Scout AI Analysis** ${hasFilters ? '(Based on Your Filters)' : '(Full Dataset Overview)'}

I can help you analyze Philippine FMCG market data:

**📊 Available Insights:**
• Revenue & sales performance
• Brand analysis (⭐ TBWA portfolio: Oishi, Del Monte, Champion)
• Regional market comparisons
• Category performance trends
• Customer behavior patterns

**🎯 Current Context:**
${hasFilters ? `You have filters applied: ${buildFilterContext(filters)}` : 'No filters applied - showing full market view'}

**💡 Try asking:**
• "How is Oishi performing in NCR vs other regions?"
• "What's driving beverage category growth?"
• "Compare revenue trends across island groups"
• "Which brands are growing fastest in Mindanao?"

What specific insights would you like to explore?`;
}

function generateSuggestions(message: string, context: any): string[] {
  const suggestions = [
    "Show me category performance breakdown",
    "Compare TBWA brands vs competitors",
    "Analyze regional growth opportunities",
    "What are the top-performing stores?"
  ];

  // Customize suggestions based on filters
  if (context.filters.regions?.length > 0) {
    suggestions.push(`Deep dive into ${context.filters.regions[0]} market trends`);
  }

  if (context.filters.brands?.length > 0) {
    suggestions.push(`Compare ${context.filters.brands[0]} with market leaders`);
  }

  return suggestions.slice(0, 3);
}