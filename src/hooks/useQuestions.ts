import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Question } from '../assets/types'

function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])

  // Helper function to sort questions
  const sortQuestions = (questions: Question[]) => 
    [...questions].sort((a, b) => {
      // First sort by votes (descending)
      if (b.votes !== a.votes) return b.votes - a.votes
      // Then by timestamp (descending) for questions with equal votes
      return b.timestamp - a.timestamp
    })

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('votes', { ascending: false }) // Primary sort in DB
      .order('timestamp', { ascending: false }) // Secondary sort in DB

    if (error) throw error

    const mappedQuestions = data?.map(item => ({
      id: item.id,
      text: item.text,
      votes: item.votes,
      author: item.author,
      isAnswered: item.is_answered,
      voters: item.voters,
      timestamp: item.timestamp
    })) || []

    setQuestions(sortQuestions(mappedQuestions))
  }

  useEffect(() => {
    fetchQuestions()
    const interval = setInterval(fetchQuestions, 10000)

    const subscription = supabase
      .channel('questions-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              setQuestions(prev => sortQuestions([
                {
                  ...payload.new,
                  isAnswered: payload.new.is_answered
                } as Question,
                ...prev
              ]))
              break
            case 'DELETE':
              setQuestions(prev => 
                sortQuestions(prev.filter(q => q.id !== payload.old.id))
              )
              break
            case 'UPDATE':
              setQuestions(prev => 
                sortQuestions(
                  prev.map(q => q.id === payload.new.id 
                    ? { ...payload.new, isAnswered: payload.new.is_answered } as Question
                    : q
                  )
                )
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  const addQuestion = async (text: string, author: string) => {
    // Create new question object
    const newQuestion: Question = {
      id: crypto.randomUUID(), // Temporary ID
      text,
      votes: 1,
      author,
      isAnswered: false,
      voters: [author],
      timestamp: Date.now()
    }

    // Optimistically update UI
    setQuestions(prev => sortQuestions([newQuestion, ...prev]))

    // Then update server
    const { error } = await supabase
      .from('questions')
      .insert({
        text,
        votes: 1,
        author,
        is_answered: false,
        voters: [author],
        timestamp: newQuestion.timestamp
      })

    if (error) {
      // Revert on error
      setQuestions(prev => sortQuestions(prev.filter(q => q.id !== newQuestion.id)))
      throw error
    }
  }

  const voteQuestion = async (questionId: string, voter: string) => {
    // Optimistically update UI
    setQuestions(prev => sortQuestions(
      prev.map(q => q.id === questionId 
        ? { ...q, votes: q.votes + 1, voters: [...q.voters, voter] }
        : q
      )
    ))

    // Then update server
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('voters, votes')
      .eq('id', questionId)
      .single()

    if (fetchError) {
      // Revert on error
      setQuestions(prev => sortQuestions(
        prev.map(q => q.id === questionId 
          ? { ...q, votes: q.votes - 1, voters: q.voters.filter(v => v !== voter) }
          : q
        )
      ))
      throw fetchError
    }

    const { error: updateError } = await supabase
      .from('questions')
      .update({
        votes: question.votes + 1,
        voters: [...question.voters, voter]
      })
      .eq('id', questionId)

    if (updateError) {
      // Revert on error
      setQuestions(prev => sortQuestions(
        prev.map(q => q.id === questionId 
          ? { ...q, votes: q.votes - 1, voters: q.voters.filter(v => v !== voter) }
          : q
        )
      ))
      throw updateError
    }
  }

  const markAnswered = async (questionId: string) => {
    // Optimistically update UI
    setQuestions(prev => sortQuestions(
      prev.map(q => q.id === questionId 
        ? { ...q, isAnswered: true }
        : q
      )
    ))

    // Then update server
    const { error } = await supabase
      .from('questions')
      .update({ is_answered: true })
      .eq('id', questionId)

    if (error) {
      // Revert on error
      setQuestions(prev => sortQuestions(
        prev.map(q => q.id === questionId 
          ? { ...q, isAnswered: false }
          : q
        )
      ))
      throw error
    }
  }

  const deleteQuestion = async (questionId: string) => {
    // Store question for potential revert
    const deletedQuestion = questions.find(q => q.id === questionId)
    
    // Optimistically update UI
    setQuestions(prev => sortQuestions(prev.filter(q => q.id !== questionId)))

    // Then update server
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (error && deletedQuestion) {
      // Revert on error
      setQuestions(prev => sortQuestions([...prev, deletedQuestion]))
      throw error
    }
  }

  const deleteAllQuestions = async () => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .neq('id', '')

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