export interface Agent {
  id: string
  name: string
  description: string
  imageUrl: string
  ideas: string[]
  about: string
  createdAt: Date
}

export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export interface Strategy {
  id: string
  title: string
  description: string
  steps: string[]
  requiredCapital: number
  status: "draft" | "pending" | "executing" | "completed"
}

export interface TEELog {
  timestamp: Date
  level: "info" | "warning" | "error"
  message: string
  data?: Record<string, any>
}

export interface MultisigWallet {
  address: string
  owners: string[]
  threshold: number
}

