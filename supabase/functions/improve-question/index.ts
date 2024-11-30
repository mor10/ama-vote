import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4.20.1'

const allowedOrigins = [
  'https://mor10-ama.netlify.app',
  'https://674ac07d3625d600089261cf--mor10-ama.netlify.app',
  /^https:\/\/[a-z0-9]+-mor10-ama\.netlify\.app$/
]

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false
  return allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) return allowed.test(origin)
    return allowed === origin
  })
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'https://mor10-ama.netlify.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  }

  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  }

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: responseHeaders
    })
  }

  // Verify request method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: responseHeaders
      }
    )
  }

  // Check content type
  const contentType = req.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return new Response(
      JSON.stringify({ error: 'Content-Type must be application/json' }),
      { 
        status: 400,
        headers: responseHeaders
      }
    )
  }

  // Check authorization
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { 
        status: 401,
        headers: responseHeaders
      }
    )
  }

  try {
    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: responseHeaders
        }
      )
    }

    // Validate text field
    const { text } = body
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text field is required and must be a string' }),
        { 
          status: 400,
          headers: responseHeaders
        }
      )
    }

    // Check OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('Missing OpenAI API key')
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { 
          status: 500,
          headers: responseHeaders
        }
      )
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that improves question clarity and formatting. Never respond to a question. Keep the original meaning but make it more concise and clear. Remove any code, hyperlinks, and inappropriate language. Make the question appropriate for a 10-year-old girl. If the question is just inappropriate language, say "Question off topic."'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    })

    const improvedText = response.choices[0]?.message?.content?.trim() || text

    return new Response(
      JSON.stringify({ improvedText }),
      { 
        status: 200,
        headers: responseHeaders
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: responseHeaders
      }
    )
  }
})