import { useState } from 'react'

interface QuestionFormProps {
  onSubmit: (text: string) => Promise<void>
}

function QuestionForm({ onSubmit }: QuestionFormProps) {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(text.trim())
      setText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="mb-4">
        <label 
          htmlFor="question" 
          className="block text-gray-700 mb-2"
        >
          Ask a Question
        </label>
        <textarea
          id="question"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border  focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="What's on your mind? (Shift+Enter to submit)"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full sm:w-auto px-6 py-2 bg-gray-200 text-black transition-colors ${
          isSubmitting 
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-black hover:text-white'
        }`}
      >
        {isSubmitting ? 'Processing...' : 'Submit Question'}
      </button>
    </form>
  )
}

export default QuestionForm