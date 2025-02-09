"use client"

import { useState } from "react"
import type { Agent, Message, Strategy, TEELog, MultisigWallet } from "@/types"
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TEELogs } from "@/components/tee-logs"
import { Send, Loader2 } from "lucide-react"

interface ChatDialogProps {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChatDialog({ agent, open, onOpenChange }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [multisig, setMultisig] = useState<MultisigWallet | null>(null)
  const [isCreatingMultisig, setIsCreatingMultisig] = useState(false)
  const [teeLogs, setTeeLogs] = useState<TEELog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")

    try {
      const response = await fetch('https://autonome.alt.technology/adapt-ai-ofrszk/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Network response was not ok')
      }

      const data = await response.json()

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.responses.join('\n'),
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentResponse])

      if (data.strategy) {
        setStrategy(data.strategy)
      }

      setTeeLogs((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          level: "info",
          message: "Received agent response",
          data: { responses: data.responses },
        },
      ])
    } catch (error) {
      console.error('Error:', error)
      setTeeLogs((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          level: "error",
          message: "Failed to get agent response",
          data: { error: String(error) },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const createMultisigWallet = async () => {
    setIsCreatingMultisig(true)
    try {
      // Simulate API call delay
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] p-6 flex flex-col">
        <DialogTitle className="sr-only">Chat Dialog</DialogTitle>

        {/*
          Top Section: Tabs and their scrollable content.
          This container takes up all available space (flex-1) and is set to overflow-hidden.
        */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="chat" className="flex flex-col h-full">
            {/* Fixed Tabs header */}
            <TabsList className="flex-none mb-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="logs">TEE Logs</TabsTrigger>
            </TabsList>

            {/* Scrollable container for tab content with custom sleek scrollbar */}
            <div className="flex-1 overflow-y-auto scroll-sleek">
              <TabsContent value="chat" className="h-full">
                <div className="pr-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[85%] break-all whitespace-pre-wrap ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {strategy && (
                    <Card className="mt-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex flex-wrap items-center justify-between gap-2">
                          <span className="break-all">{strategy.title}</span>
                          <span className="text-sm font-normal text-muted-foreground">
                            Status: {strategy.status}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm break-all whitespace-pre-wrap">
                          {strategy.description}
                        </p>
                        <ul className="list-inside list-disc space-y-1">
                          {strategy.steps.map((step, index) => (
                            <li key={index} className="text-sm break-all whitespace-pre-wrap">
                              {step}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-sm">
                          Required Capital: ${strategy.requiredCapital}
                        </p>
                      </CardContent>
                      <CardFooter>
                        {strategy.status === "draft" && (
                          <Button
                            onClick={createMultisigWallet}
                            disabled={isCreatingMultisig}
                            className="w-full"
                          >
                            {isCreatingMultisig && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Multisig & Execute Strategy
                          </Button>
                        )}
                        {multisig && (
                          <div className="w-full text-center text-sm text-muted-foreground break-all">
                            Multisig created at {multisig.address}
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="h-full">
                <div className="pr-4">
                  <TEELogs logs={teeLogs} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/*
          Bottom Section: Input Form (always visible).
          This container does not grow and is placed below the scrollable area.
        */}
        <div className="mt-4 flex-shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>

      {/*
        Global CSS for a sleek custom scrollbar.
        You can move this to your global CSS file if preferred.
      */}
      <style jsx global>{`
        .scroll-sleek::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scroll-sleek::-webkit-scrollbar-track {
          background:rgb(107, 49, 223);
        }
        .scroll-sleek::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 10px;
          border: 2px solidrgb(0, 21, 97);
        }
        .scroll-sleek::-webkit-scrollbar-thumb:hover {
          background-color: #555;
        }
      `}</style>
    </Dialog>
  )
}

