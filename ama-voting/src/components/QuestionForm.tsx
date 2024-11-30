import { useState } from 'react'

interface QuestionFormProps {
  onSubmit: (text: string) => void
}

function QuestionForm({ onSubmit }: QuestionFormProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    
    onSubmit(text.trim())
    setText('')
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
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="What's on your mind?"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-black rounded-lg hover:bg-black hover:text-white transition-colors"
      >
        Submit Question
      </button>
    </form>
  )
}

export default QuestionForm