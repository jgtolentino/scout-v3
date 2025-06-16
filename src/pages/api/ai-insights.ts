// src/pages/api/ai-insights.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIClient, AzureKeyCredential } from '@azure/openai'

type AIInsight = {
  insight: string
  confidence: number
  category: 'trend' | 'opportunity' | 'alert'
  actionItems: string[]
}

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT!,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY!)
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ insights: AIInsight[] } | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const { dateRange, barangays, categories, brands, stores } = req.body as {
    dateRange: { from: string; to: string }
    barangays: string[]
    categories: string[]
    brands: string[]
    stores: string[]
  }

  // Build a concise system+user message for Chat Completion
  const system = {
    role: 'system',
    content: `You are a retail analytics assistant. Given a filter context, generate 3 concise AI insights with confidence scores (0–1), a category (trend/opportunity/alert), and 1–2 actionable items each.`
  }

  const user = {
    role: 'user',
    content: JSON.stringify({
      filters: { dateRange, barangays, categories, brands, stores },
      dataVolume: { transactions: 5000 }
    })
  }

  try {
    const poll = await client.getChatCompletions('gpt-35-turbo', {
      messages: [system, user],
      temperature: 0.7,
      maxTokens: 500
    })

    const text = poll.choices[0].message?.content || ''
    // Expecting JSON array; parse defensively
    let raw: unknown
    try {
      raw = JSON.parse(text)
    } catch {
      return res.status(502).json({ error: 'Invalid AI response format' })
    }

    // Validate & cast
    const insights: AIInsight[] = Array.isArray(raw)
      ? raw.map((i) => ({
          insight: i.insight,
          confidence: Math.min(Math.max(i.confidence, 0), 1),
          category: ['trend','opportunity','alert'].includes(i.category) ? i.category : 'trend',
          actionItems: Array.isArray(i.actionItems) ? i.actionItems.slice(0,3) : []
        }))
      : []

    return res.status(200).json({ insights })
  } catch (err: unknown) {
    console.error('AI insight error', err)
    return res.status(500).json({ error: (err as Error).message || 'AI request failed' })
  }
}