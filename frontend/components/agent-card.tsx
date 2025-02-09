"use client"

import type { Agent } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare, Lightbulb, Info, Calendar, Loader2, Send } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface AgentCardProps {
  agent: Agent
  onChat: (agent: Agent) => void
}

export function AgentCard({ agent, onChat }: AgentCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogTrigger asChild>
        <Card className="glass-card group cursor-pointer overflow-hidden transition-all hover:scale-[1.02]">
          <CardContent className="p-0">
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <Image
                  src={agent.imageUrl || "/placeholder.svg"}
                  alt={agent.name}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <div className="absolute bottom-0 p-4">
                <h3 className="mb-1 text-lg font-semibold text-white">{agent.name}</h3>
                <p className="text-sm text-gray-200">{agent.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{agent.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="aspect-square overflow-hidden rounded-lg">
            <Image
              src={agent.imageUrl || "/placeholder.svg"}
              alt={agent.name}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Lightbulb className="h-5 w-5" />
                Strategies
              </h4>
              <ul className="list-inside list-disc space-y-2">
                {agent.strategies.map((strategy, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Info className="h-5 w-5" />
                About
              </h4>
              <p className="text-sm text-muted-foreground">{agent.about}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created on {agent.createdAt.toLocaleDateString()}
            </div>
            <Button
              onClick={() => {
                setShowDetails(false)
                onChat(agent)
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat with Agent
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

