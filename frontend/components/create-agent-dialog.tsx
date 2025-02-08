"use client"

import { useState, type ChangeEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Upload } from "lucide-react"

interface CreateAgentDialogProps {
  onCreateAgent: (name: string, strategies: string[], about: string, apiUrl: string, imageFile: File | null) => void
}

export function CreateAgentDialog({ onCreateAgent }: CreateAgentDialogProps) {
  const [name, setName] = useState("")
  const [strategies, setStrategies] = useState("")
  const [about, setAbout] = useState("")
  const [apiUrl, setApiUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string>("")
  const [open, setOpen] = useState(false)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateAgent(name, strategies.split("\n"), about, apiUrl, imageFile)
    setOpen(false)
    setName("")
    setStrategies("")
    setAbout("")
    setApiUrl("")
    setImageFile(null)
    setImagePreviews("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-[344px] w-full glass-card">
          <Plus className="mr-2 h-5 w-5" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="strategies">Strategies (one per line)</Label>
            <Textarea id="strategies" value={strategies} onChange={(e) => setStrategies(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="about">About</Label>
            <Textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input id="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Image (1:1 ratio)</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreviews && (
                <div className="h-16 w-16 overflow-hidden rounded-full">
                  <img src={imagePreviews || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <Button type="submit">Create Agent</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

