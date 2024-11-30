import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://mor10-ama.netlify.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Length': '0'
      }
    })
  }

  const responseHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json'
  }

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
    const { text } = await req.json()
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400,
          headers: responseHeaders
        }
      )
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    if (!Deno.env.get('OPENAI_API_KEY')) {
      console.error('Missing OpenAI API key')
      return new Response(
        JSON.stringify({ error: 'Configuration error' }),
        { 
          status: 500,
          headers: responseHeaders
        }
      )
    }

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
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: responseHeaders
      }
    )
  }
})