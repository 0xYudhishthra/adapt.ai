"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Header from "@/components/Header"
import { AgentCard } from "@/components/agent-card"
import { CreateAgentDialog } from "@/components/create-agent-dialog"
import { ChatDialog } from "@/components/chat-dialog" // Ensure ChatDialog is exported properly
import { Footer } from "@/components/footer"
import WarpBackground from "@/components/WarpBackground"

export interface Agent {
  id: string
  name: string
  description: string
  imageUrl: string
  strategies: string[]
  about: string
  apiUrl: string
  createdAt: Date
}

const initialAgents: Agent[] = [
  {
    id: "1",
    name: "Farmmy",
    description: "Specializes in DeFi yield optimization strategies",
    imageUrl: "/farmmy.jpg?height=400&width=400",
    strategies: [
      "Automated yield farming across multiple protocols",
      "Risk-adjusted portfolio rebalancing",
      "MEV protection strategies",
      "Gas optimization for frequent transactions",
    ],
    about:
      "An advanced AI agent designed to maximize DeFi yields while maintaining optimal risk levels. Utilizes TEE for secure execution and real-time market analysis.",
    apiUrl: "https://api.adapt.ai/yield-optimizer",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "CoinScope",
    description: "Provides technical analysis and trading strategies",
    imageUrl: "/scope2.jpg?height=400&width=400",
    strategies: [
      "Cross-chain arbitrage opportunities",
      "Trend following with ML signals",
      "Liquidation protection strategies",
      "Smart order routing",
    ],
    about:
      "Expert trading agent combining traditional technical analysis with on-chain data. Executes trades through secure TEE environment with verifiable execution logs.",
    apiUrl: "https://api.adapt.ai/trading-expert",
    createdAt: new Date(),
  },
]

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  const handleCreateAgent = (
    name: string,
    strategies: string[],
    about: string,
    apiUrl: string,
    imageFile: File | null,
  ) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name,
      description: strategies[0],
      imageUrl: imageFile
        ? URL.createObjectURL(imageFile)
        : "/placeholder.svg?height=400&width=400",
      strategies,
      about,
      apiUrl,
      createdAt: new Date(),
    }
    setAgents((prev) => [...prev, newAgent])
  }

  const handleChat = (agent: Agent) => {
    setSelectedAgent(agent)
    setChatOpen(true)
  }

  return (
    <div>
      {/* Warp background is placed behind everything */}
      <WarpBackground />
      {/* Wrap the entire content in a motion.div for a fade-in when the page loads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex min-h-screen flex-col bg-transparent"
      >
        <Header />
        <main className="container mx-auto flex-grow px-4 pt-24">
          {/* Animate the grid of cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onChat={handleChat} />
            ))}
            <CreateAgentDialog onCreateAgent={handleCreateAgent} />
          </motion.div>
        </main>
        <ChatDialog agent={selectedAgent} open={chatOpen} onOpenChange={setChatOpen} />
        <Footer />
      </motion.div>
    </div>
  )
}

