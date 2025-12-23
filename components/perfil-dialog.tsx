"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Copy, Check } from "lucide-react"

export function PerfilDialog({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false)

  const copiarUserId = () => {
    navigator.clipboard.writeText(userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
          <DialogDescription>
            Compartilhe seu ID de usuário para que outros possam adicionar você às listas deles
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="userId">Meu ID de Usuário</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                value={userId}
                readOnly
                className="font-mono text-xs sm:text-sm truncate min-w-0"
              />
              <Button
                type="button"
                size="icon"
                onClick={copiarUserId}
                className="shrink-0 h-10 w-10"
                variant={copied ? "default" : "outline"}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copie este ID e envie para quem deseja compartilhar listas com você
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
