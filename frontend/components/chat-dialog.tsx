"use client"

import { useState } from "react"
import type { Agent, Message, Strategy, TEELog, MultisigWallet } from "@/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TEELogs } from "@/components/tee-logs"
import { Send, Loader2 } from "lucide-react"

interface ChatDialogProps {
  agent: Agent | null
  open: boolean
  onOpenChangeAction: (open: boolean) => void
}

export function ChatDialog({ agent, open, onOpenChangeAction }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [multisig, setMultisig] = useState<MultisigWallet | null>(null)
  const [isCreatingMultisig, setIsCreatingMultisig] = useState(false)
  const [teeLogs, setTeeLogs] = useState<TEELog[]>([])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "I've analyzed your request. Here's a potential strategy...",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, response])

      // Simulate strategy proposal
      setStrategy({
        id: Date.now().toString(),
        title: "Yield Farming Strategy",
        description: "A balanced approach to maximize returns while minimizing risk",
        steps: ["Deploy capital to stable coin pool", "Monitor APY rates", "Rebalance as needed"],
        requiredCapital: 1000,
        status: "draft",
      })

      // Simulate TEE log
      setTeeLogs((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          level: "info",
          message: "Strategy analysis completed",
          data: { confidence: 0.95 },
        },
      ])
    }, 1000)
  }

  const createMultisigWallet = async () => {
    setIsCreatingMultisig(true)
    try {
      // Simulate Safe API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMultisig({
        address: "0x123...abc",
        owners: ["0x456...def", "0x789...ghi"],
        threshold: 2,
      })

      setTeeLogs((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          level: "info",
          message: "Multisig wallet created",
          data: { address: "0x123...abc" },
        },
      ])

      setStrategy((prev) => (prev ? { ...prev, status: "executing" } : null))
    } catch (error) {
      setTeeLogs((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          level: "error",
          message: "Failed to create multisig wallet",
          data: { error: String(error) },
        },
      ])
    } finally {
      setIsCreatingMultisig(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[800px]">
        <Tabs defaultValue="chat" className="h-[700px]">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="logs">TEE Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="mt-4 h-[calc(100%-40px)]">
            <div className="flex h-full flex-col">
              <ScrollArea className="flex-1 pr-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {strategy && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {strategy.title}
                        <span className="text-sm font-normal text-muted-foreground">Status: {strategy.status}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-2">{strategy.description}</p>
                      <ul className="list-inside list-disc space-y-1">
                        {strategy.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                      <p className="mt-4">Required Capital: ${strategy.requiredCapital}</p>
                    </CardContent>
                    <CardFooter>
                      {strategy.status === "draft" && (
                        <Button onClick={createMultisigWallet} disabled={isCreatingMultisig} className="w-full">
                          {isCreatingMultisig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Multisig & Execute Strategy
                        </Button>
                      )}
                      {multisig && (
                        <div className="w-full text-center text-sm text-muted-foreground">
                          Multisig created at {multisig.address}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </ScrollArea>
              <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </TabsContent>
          <TabsContent value="logs" className="mt-4">
            <TEELogs logs={teeLogs} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

