import { useState, useEffect } from 'react'
import type { Question } from '../assets/types'
import { supabase, improveQuestion } from '../lib/supabase'

function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('votes', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    }

    fetchQuestions()

    const subscription = supabase
      .channel('questions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, fetchQuestions)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addQuestion = async (text: string, author: string) => {
    const improvedText = await improveQuestion(text)
    
    const { error } = await supabase
      .from('questions')
      .insert({
        text: improvedText,
        votes: 1,
        author,
        isAnswered: false,
        voters: [author],
        timestamp: Date.now()
      })

    if (error) throw error
  }

  const voteQuestion = async (questionId: string, voter: string) => {
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('voters, votes')
      .eq('id', questionId)
      .single()

    if (fetchError) throw fetchError

    const { error: updateError } = await supabase
      .from('questions')
      .update({
        votes: question.votes + 1,
        voters: [...question.voters, voter]
      })
      .eq('id', questionId)

    if (updateError) throw updateError
  }

  const markAnswered = async (questionId: string) => {
    const { error } = await supabase
      .from('questions')
      .update({ isAnswered: true })
      .eq('id', questionId)

    if (error) throw error
  }

  const deleteQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (error) throw error
  }

  const deleteAllQuestions = async () => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .neq('id', '')  // Delete all rows

    if (error) throw error
  }

  return { 
    questions, 
    addQuestion, 
    voteQuestion, 
    markAnswered, 
    deleteQuestion,
    deleteAllQuestions 
  }
}

export default useQuestions