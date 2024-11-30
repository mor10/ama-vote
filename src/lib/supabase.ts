import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-user-name': localStorage.getItem('ama_user') 
        ? JSON.parse(localStorage.getItem('ama_user')!).name 
        : '',
      'x-user-role': localStorage.getItem('ama_user') 
        ? JSON.parse(localStorage.getItem('ama_user')!).isAdmin 
          ? 'admin' 
          : 'user'
        : 'anonymous'
    }
  },
  db: {
    schema: 'public'
  }
})

export async function improveQuestion(text: string): Promise<string> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/improve-question`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ text })
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to improve question')
  }
  
  const { improvedText } = await response.json()
  return improvedText
}