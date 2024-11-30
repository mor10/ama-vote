import type { Question } from '../../ama-voting/src/assets/types'

export interface ApiResponse {
  success: boolean
  data?: Question[]
  error?: string
} 