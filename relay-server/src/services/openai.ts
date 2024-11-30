import * as dotenv from 'dotenv'
import OpenAI from 'openai'

dotenv.config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required')
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

export async function improveQuestion(text: string): Promise<string> {

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
      max_tokens: 200
    })

    return response.choices[0]?.message?.content?.trim() || text
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'The AI refuses to improve the question.'
  }
}