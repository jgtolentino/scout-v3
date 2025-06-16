/**
 * Streams completion tokens from Azure OpenAI → client as SSE
 * Exposed at `/functions/v1/azure_openai_stream`
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

const AZURE_ENDPOINT = Deno.env.get('AZURE_OPENAI_ENDPOINT') ?? 'https://tbwa-openai.openai.azure.com/';
const AZURE_API_KEY  = Deno.env.get('AZURE_OPENAI_API_KEY') ?? '1234567890abcdef1234567890abcdef';
const DEPLOYMENT     = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') ?? 'gpt-4';
const API_VER        = Deno.env.get('AZURE_OPENAI_API_VERSION') ?? '2024-02-15-preview';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check if Azure OpenAI is configured
    if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Azure OpenAI not configured',
        insights: [
          {
            insight: 'Azure OpenAI integration disabled. Configure AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY to enable AI insights.',
            confidence: 0,
            category: 'system',
            actionItems: ['Contact system administrator to configure Azure OpenAI credentials']
          }
        ]
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, transactionData } = await req.json();
    
    // Enhanced prompt with Philippine retail context
    const enhancedPrompt = `
As a Philippine retail analytics AI, analyze the following transaction data and provide actionable business insights:

Data Context:
${JSON.stringify(transactionData, null, 2)}

Please provide 3 specific insights in this exact JSON format:
{
  "insights": [
    {
      "insight": "Specific observation about the data with Philippine market context",
      "confidence": 85,
      "category": "trend|opportunity|alert",
      "actionItems": ["Specific action 1", "Specific action 2"]
    }
  ]
}

Focus on:
1. Philippine market trends and seasonal patterns
2. Regional performance differences (Manila, Cebu, Davao, etc.)
3. Category performance with local consumer behavior
4. Revenue optimization opportunities
5. Inventory and supply chain insights

Provide insights with confidence scores and actionable recommendations.
`;

    const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VER}`;

    const aiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Philippine retail analytics AI. Provide insights in valid JSON format only.'
          },
          {
            role: 'user', 
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!aiRes.ok) {
      const errorBody = await aiRes.text();
      console.error('Azure OpenAI error:', errorBody);
      return new Response(JSON.stringify({ 
        error: 'AI service unavailable',
        insights: [
          {
            insight: 'AI insights temporarily unavailable. Showing cached recommendations.',
            confidence: 50,
            category: 'system',
            actionItems: ['Check AI service status', 'Review manual analytics']
          }
        ]
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            buffer += chunk;

            // Process SSE chunks
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                } else {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || '';
                    if (content) {
                      controller.enqueue(new TextEncoder().encode(`data: ${content}\n\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON chunks
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.enqueue(new TextEncoder().encode(`data: [ERROR]\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Azure OpenAI Stream error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      insights: [
        {
          insight: 'AI insights service encountered an error. Using fallback analytics.',
          confidence: 30,
          category: 'alert',
          actionItems: ['Check service logs', 'Review system status']
        }
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});