import { useState } from 'react'
import useAuth from './hooks/useAuth'
import useQuestions from './hooks/useQuestions'
import LoginForm from './components/LoginForm'
import QuestionList from './components/QuestionList'
import QuestionForm from './components/QuestionForm'

function App() {
  const { user, login, logout } = useAuth()
  const { questions, addQuestion, voteQuestion, markAnswered } = useQuestions()
  const [activeTab, setActiveTab] = useState<'pending' | 'answered' | 'ask'>('pending')

  if (!user) return <LoginForm onLogin={login} />

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AMA Session</h1>
        <button
          onClick={logout}
          className="px-4 py-2 border border-gray-300 text-gray-600  hover:bg-red-500 hover:text-white hover:border-red-500 focus:bg-red-500 focus:text-white focus:border-red-500 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2  transition-colors ${
            activeTab === 'pending' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Questions
        </button>
        <button
          className={`px-4 py-2  transition-colors ${
            activeTab === 'answered' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('answered')}
        >
          Answered
        </button>
        <button
          className={`px-4 py-2  transition-colors ${
            activeTab === 'ask' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => setActiveTab('ask')}
        >
          Ask a Question
        </button>
      </div>

      {activeTab === 'ask' ? (
        <QuestionForm 
          onSubmit={(text) => {
            addQuestion(text, user.name)
            setActiveTab('pending')
          }} 
        />
      ) : (
        <QuestionList
          questions={questions.filter(q => q.isAnswered === (activeTab === 'answered'))}
          onVote={voteQuestion}
          onMarkAnswered={markAnswered}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default App