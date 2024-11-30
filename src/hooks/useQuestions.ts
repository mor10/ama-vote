import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Question } from '../assets/types'

function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const fetchQuestions = async () => {
      console.log('Fetching questions...')
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('votes', { ascending: false })

      if (error) {
        console.error('Error fetching questions:', error)
        throw error
      }
      console.log('Fetched questions:', data)
      setQuestions(data || [])
    }

    // Initial fetch
    fetchQuestions()

    // Set up real-time subscription
    const subscription = supabase
      .channel('questions')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'questions' 
        },
        (payload) => {
          // Handle different types of changes
          switch (payload.eventType) {
            case 'INSERT':
              setQuestions(prev => [...prev, payload.new as Question])
              break
            case 'DELETE':
              setQuestions(prev => prev.filter(q => q.id !== payload.old.id))
              break
            case 'UPDATE':
              setQuestions(prev => 
                prev.map(q => q.id === payload.new.id ? (payload.new as Question) : q)
              )
              break
            default:
              // Fetch all questions again for other cases
              fetchQuestions()
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const addQuestion = async (author: string, content: string) => {
    const { error } = await supabase
      .from('questions')
      .insert({
        content,
        votes: 1,
        author,
        is_answered: false,
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
      .update({ is_answered: true })
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