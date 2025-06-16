import { generateText } from 'ai'
import {
  createAI,
  getMutableAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { nanoid } from 'nanoid'

// Import our existing components
import { LineChart } from '../components/charts/LineChart'
import { BarChart } from '../components/charts/BarChart'
import { DonutChart } from '../components/charts/DonutChart'
import { TransactionDataTable } from '../components/TransactionDataTable'

// RetailBot Message Components
const RetailBotCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
    {children}
  </div>
)

const RetailBotMessage = ({ content }: { content: any }) => (
  <div className="text-gray-900 text-sm whitespace-pre-wrap">
    {content}
  </div>
)

const SpinnerMessage = () => (
  <div className="flex items-center space-x-2">
    <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
    <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <span className="text-gray-600">Scout is analyzing...</span>
  </div>
)

export type AIState = {
  chatId: string
  messages: any[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

interface MutableAIState {
  update: (newState: any) => void
  done: (newState: any) => void
  get: () => AIState
}

// Use Azure OpenAI instead of Groq for better Philippine market context
const AZURE_OPENAI_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT
const AZURE_OPENAI_KEY = process.env.VITE_AZURE_OPENAI_KEY
const AZURE_OPENAI_DEPLOYMENT = process.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4'

// Philippine Retail Market Context
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

RESPONSE GUIDELINES:
1. Always use ₱ for currency formatting
2. Reference actual filter context when provided
3. Highlight TBWA brands with ⭐ or special mention
4. Provide actionable insights, not just data
5. Use Filipino market terminology naturally
6. Include regional comparisons when relevant
7. Format with emojis and clear sections for readability
`

async function generateRetailCaption(
  analysisType: string,
  parameters: any,
  toolName: string,
  aiState: MutableAIState
): Promise<string> {
  try {
    const openai = createOpenAI({
      baseURL: AZURE_OPENAI_ENDPOINT,
      apiKey: AZURE_OPENAI_KEY,
    })

    const response = await generateText({
      model: openai(AZURE_OPENAI_DEPLOYMENT),
      messages: [
        {
          role: 'system',
          content: PHILIPPINE_RETAIL_CONTEXT + `
          
You have just called a tool (${toolName} for ${analysisType}) to respond to the user. Now generate a brief, insightful text to go alongside that analysis.

Keep it 2-3 sentences and focus on actionable insights for Philippine retail markets.`
        },
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ]
    })
    return response.text || ''
  } catch (err) {
    return '' // Send tool use without caption
  }
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof RetailBot>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode

  try {
    const openai = createOpenAI({
      baseURL: AZURE_OPENAI_ENDPOINT,
      apiKey: AZURE_OPENAI_KEY,
    })

    const result = await streamUI({
      model: openai(AZURE_OPENAI_DEPLOYMENT),
      initial: <SpinnerMessage />,
      maxRetries: 1,
      system: PHILIPPINE_RETAIL_CONTEXT + `

### Available Tools:
1. showRevenueAnalysis - Revenue trends and performance metrics
2. showBrandPerformance - Brand comparison and market share analysis  
3. showRegionalAnalysis - Geographic performance breakdown
4. showCategoryAnalysis - Product category insights
5. showConsumerInsights - Customer demographics and behavior
6. showTransactionDetails - Detailed transaction records
7. showRecommendations - Strategic business recommendations

Always use the most relevant tool for the user's question about Philippine retail markets.`,
      messages: [
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <RetailBotMessage content={textStream.value} />
        }

        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content
              }
            ]
          })
        } else {
          textStream.update(delta)
        }

        return textNode
      },
      tools: {
        showRevenueAnalysis: {
          description: 'Show revenue trends, performance metrics, and financial insights for Philippine retail markets',
          parameters: z.object({
            timeframe: z.string().default('30d').describe('Time period: 7d, 30d, 90d, or ytd'),
            region: z.string().optional().describe('Specific region to focus on (NCR, CALABARZON, etc.)'),
            brand: z.string().optional().describe('Specific brand to analyze')
          }),
          generate: async function* ({ timeframe, region, brand }) {
            yield (
              <RetailBotCard>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </RetailBotCard>
            )

            const toolCallId = nanoid()

            // Mock revenue data based on our known totals
            const revenueData = [
              { date: '2024-05-01', value: 45000 },
              { date: '2024-05-15', value: 52000 },
              { date: '2024-06-01', value: 48000 },
              { date: '2024-06-15', value: 55000 }
            ]

            const kpis = {
              totalRevenue: '₱1,213,902.44',
              transactions: '5,000',
              averageOrderValue: '₱242.78',
              growth: '+12.3%'
            }

            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'showRevenueAnalysis',
                      toolCallId,
                      args: { timeframe, region, brand }
                    }
                  ]
                }
              ]
            })

            const caption = await generateRetailCaption(
              'Revenue Analysis',
              { timeframe, region, brand },
              'showRevenueAnalysis',
              aiState
            )

            return (
              <RetailBotCard>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      📊 Revenue Analysis {region && `- ${region}`} {brand && `- ${brand}`}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
                        <div className="text-xl font-bold text-blue-900">{kpis.totalRevenue}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Growth</div>
                        <div className="text-xl font-bold text-green-900">{kpis.growth}</div>
                      </div>
                    </div>
                  </div>
                  <LineChart 
                    data={revenueData} 
                    xKey="date" 
                    yKey="value" 
                    title="Revenue Trend"
                    className="h-64"
                  />
                  <div className="text-sm text-gray-700">
                    {caption}
                  </div>
                </div>
              </RetailBotCard>
            )
          }
        },
        showBrandPerformance: {
          description: 'Show brand performance comparison, market share, and TBWA portfolio analysis',
          parameters: z.object({
            category: z.string().optional().describe('Product category to focus on'),
            region: z.string().optional().describe('Geographic region for analysis'),
            comparison: z.boolean().default(false).describe('Include competitive comparison')
          }),
          generate: async function* ({ category, region, comparison }) {
            yield (
              <RetailBotCard>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </RetailBotCard>
            )

            const brandData = [
              { name: '⭐ Oishi', value: 15.5, revenue: 188000, growth: '+18%' },
              { name: '⭐ Del Monte', value: 12.3, revenue: 149000, growth: '+8%' },
              { name: '⭐ Champion', value: 9.8, revenue: 119000, growth: '+22%' },
              { name: 'Nestle', value: 18.2, revenue: 221000, growth: '+5%' },
              { name: 'Unilever', value: 11.1, revenue: 135000, growth: '+3%' }
            ]

            const caption = await generateRetailCaption(
              'Brand Performance',
              { category, region, comparison },
              'showBrandPerformance',
              aiState
            )

            return (
              <RetailBotCard>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🏷️ Brand Performance {category && `- ${category}`} {region && `- ${region}`}
                    </h3>
                    <div className="text-sm text-gray-600 mb-4">
                      ⭐ indicates TBWA portfolio brands
                    </div>
                  </div>
                  <BarChart 
                    data={brandData} 
                    xKey="name" 
                    yKey="value" 
                    title="Market Share (%)"
                    className="h-64"
                  />
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {brandData.slice(0, 3).map(brand => (
                      <div key={brand.name} className="bg-gray-50 p-2 rounded">
                        <div className="font-medium">{brand.name}</div>
                        <div className="text-green-600">{brand.growth}</div>
                        <div className="text-gray-600">₱{brand.revenue.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-700">
                    {caption}
                  </div>
                </div>
              </RetailBotCard>
            )
          }
        },
        showRegionalAnalysis: {
          description: 'Show geographic performance breakdown across Philippine regions',
          parameters: z.object({
            metric: z.enum(['revenue', 'transactions', 'customers']).default('revenue'),
            islandGroup: z.string().optional().describe('Focus on Luzon, Visayas, or Mindanao')
          }),
          generate: async function* ({ metric, islandGroup }) {
            yield (
              <RetailBotCard>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </RetailBotCard>
            )

            const regionalData = [
              { region: 'NCR', value: 425000, share: 35, customers: 348 },
              { region: 'CALABARZON', value: 218000, share: 18, customers: 182 },
              { region: 'Central Luzon', value: 170000, share: 14, customers: 141 },
              { region: 'Central Visayas', value: 145000, share: 12, customers: 120 },
              { region: 'Western Visayas', value: 97000, share: 8, customers: 80 },
              { region: 'Davao Region', value: 85000, share: 7, customers: 70 }
            ]

            const caption = await generateRetailCaption(
              'Regional Analysis',
              { metric, islandGroup },
              'showRegionalAnalysis',
              aiState
            )

            return (
              <RetailBotCard>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🗺️ Regional Performance {islandGroup && `- ${islandGroup}`}
                    </h3>
                  </div>
                  <BarChart 
                    data={regionalData} 
                    xKey="region" 
                    yKey="value" 
                    title={`${metric.charAt(0).toUpperCase() + metric.slice(1)} by Region`}
                    className="h-64"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-900">Top Performers:</div>
                      <div className="text-blue-600">🏙️ NCR: 35% market share</div>
                      <div className="text-green-600">🏘️ CALABARZON: 18% share</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Growth Opportunities:</div>
                      <div className="text-orange-600">🌴 Mindanao: Emerging market</div>
                      <div className="text-purple-600">🏝️ Visayas: High brand loyalty</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    {caption}
                  </div>
                </div>
              </RetailBotCard>
            )
          }
        },
        showTransactionDetails: {
          description: 'Show detailed transaction records with search and filtering capabilities',
          parameters: z.object({
            limit: z.number().default(50).describe('Number of records to display'),
            searchTerm: z.string().optional().describe('Search term for filtering')
          }),
          generate: async function* ({ limit, searchTerm }) {
            yield (
              <RetailBotCard>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </RetailBotCard>
            )

            const caption = await generateRetailCaption(
              'Transaction Details',
              { limit, searchTerm },
              'showTransactionDetails',
              aiState
            )

            return (
              <RetailBotCard>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      📋 Transaction Records {searchTerm && `- "${searchTerm}"`}
                    </h3>
                    <div className="text-sm text-gray-600">
                      Complete view of FMCG transaction data with search and export capabilities
                    </div>
                  </div>
                  <TransactionDataTable className="max-h-96 overflow-y-auto" />
                  <div className="text-sm text-gray-700">
                    {caption}
                  </div>
                </div>
              </RetailBotCard>
            )
          }
        }
      }
    })

    return {
      id: nanoid(),
      display: result.value
    }
  } catch (err: any) {
    return {
      id: nanoid(),
      display: (
        <RetailBotCard>
          <div className="text-red-700 font-medium">Error: {err.message}</div>
          <div className="text-sm text-red-600 mt-2">
            Scout is having trouble accessing the retail data. Please try again or check your connection.
          </div>
        </RetailBotCard>
      )
    }
  }
}

export const RetailBot = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] }
})