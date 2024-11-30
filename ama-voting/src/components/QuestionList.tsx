import type { Question, User } from '../assets/types'

interface QuestionListProps {
  questions: Question[]
  onVote: (questionId: string, voter: string) => void
  onMarkAnswered: (questionId: string) => void
  currentUser: User
}

function QuestionList({ questions, onVote, onMarkAnswered, currentUser }: QuestionListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {questions.map(question => (
        <div 
          key={question.id}
          className="py-6 flex items-center gap-6"
        >
          {/* Vote count box */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 border border-gray-200 rounded-lg flex flex-col items-center justify-center bg-gray-50">
              <span className="text-2xl font-bold text-gray-700">{question.votes}</span>
              <span className="text-xs text-gray-500">votes</span>
            </div>
          </div>
          
          {/* Question content */}
          <div className="flex-1 min-w-0">
            <p className="text-lg text-gray-900 mb-1">{question.text}</p>
            <p className="text-sm text-gray-500">
              Asked by {question.author} • {new Date(question.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex gap-2">
            {!question.isAnswered && (
              question.voters.includes(currentUser.name) ? (
                <div 
                  className="h-10 w-10 border border-gray-300 text-gray-400 rounded-lg flex items-center justify-center bg-gray-50"
                  aria-label="Already voted"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              ) : (
                <button
                  onClick={() => onVote(question.id, currentUser.name)}
                  className="h-10 w-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-medium"
                >
                  +1
                </button>
              )
            )}
            
            {currentUser.isAdmin && !question.isAnswered && (
              <button
                onClick={() => onMarkAnswered(question.id)}
                className="h-10 px-4 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Mark Answered
              </button>
            )}
          </div>
        </div>
      ))}

      {questions.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No questions yet. Be the first to ask!
        </div>
      )}
    </div>
  )
}

export default QuestionList