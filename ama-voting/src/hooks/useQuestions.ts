import { useState, useEffect } from 'react'
import type { Question } from '../assets/types'

const API_URL = 'http://localhost:3000'

function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])

  // Fetch questions on mount and poll every 2 seconds
  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(`${API_URL}/questions`)
      const { data } = await response.json()
      setQuestions(data)
    }

    fetchQuestions()
    const interval = setInterval(fetchQuestions, 5000)
    return () => clearInterval(interval)
  }, [])

  const addQuestion = async (text: string, author: string) => {
    const response = await fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author })
    })
    const { data } = await response.json()
    setQuestions(data)
  }

  const voteQuestion = async (questionId: string, voter: string) => {
    const response = await fetch(`${API_URL}/questions/${questionId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voter })
    })
    const { data } = await response.json()
    setQuestions(data)
  }

  const markAnswered = async (questionId: string) => {
    const response = await fetch(`${API_URL}/questions/${questionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const { data } = await response.json()
    setQuestions(data)
  }

  return { questions, addQuestion, voteQuestion, markAnswered }
}

export default useQuestions