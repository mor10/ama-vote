import express from 'express'
import cors from 'cors'
import type { Question } from '../../ama-voting/src/assets/types'
import type { ApiResponse } from './types'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

// In-memory storage
let questions: Question[] = []

// Get all questions
app.get('/questions', (_, res) => {
  const response: ApiResponse = { success: true, data: questions }
  res.json(response)
})

// Add a question
app.post('/questions', (req, res) => {
  const { text, author } = req.body
  
  if (!text?.trim() || !author?.trim()) {
    const response: ApiResponse = { success: false, error: 'Invalid input' }
    return res.status(400).json(response)
  }

  const newQuestion: Question = {
    id: crypto.randomUUID(),
    text: text.trim(),
    votes: 1,
    author: author.trim(),
    isAnswered: false,
    voters: [author],
    timestamp: Date.now()
  }

  questions = [...questions, newQuestion].sort((a, b) => b.votes - a.votes)
  
  const response: ApiResponse = { success: true, data: questions }
  res.json(response)
})

// Vote on a question
app.post('/questions/:id/vote', (req, res) => {
  const { id } = req.params
  const { voter } = req.body

  if (!voter?.trim()) {
    const response: ApiResponse = { success: false, error: 'Invalid voter' }
    return res.status(400).json(response)
  }

  questions = questions.map(q => {
    if (q.id === id && !q.voters.includes(voter)) {
      return { ...q, votes: q.votes + 1, voters: [...q.voters, voter] }
    }
    return q
  }).sort((a, b) => b.votes - a.votes)

  const response: ApiResponse = { success: true, data: questions }
  res.json(response)
})

// Mark question as answered
app.post('/questions/:id/answer', (req, res) => {
  const { id } = req.params
  
  questions = questions.map(q => 
    q.id === id ? { ...q, isAnswered: true } : q
  )

  const response: ApiResponse = { success: true, data: questions }
  res.json(response)
})

app.listen(port, () => {
  console.log(`Relay server running at http://localhost:${port}`)
}) 