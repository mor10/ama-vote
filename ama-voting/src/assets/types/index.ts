export interface Question {
    id: string
    text: string
    votes: number
    author: string
    isAnswered: boolean
    voters: string[]
    timestamp: number
  }
  
  export interface User {
    name: string
    isAdmin: boolean
  }