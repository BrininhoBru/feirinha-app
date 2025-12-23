"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ShoppingBasket, ChevronRight, LogOut, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PerfilDialog } from "@/components/perfil-dialog"

interface Lista {
  id: string
  nome: string
  criada_em: string
  concluida: boolean
  criador_id: string
  user_id: string
}

export function ListasView({ userId }: { userId: string }) {
  const [listas, setListas] = useState<Lista[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    carregarListas()

    // Configurar subscriptions em tempo real
    const supabase = createClient()
    
    // Subscription para mudanças nas listas
    const listasChannel = supabase
      .channel(`listas-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listas'
        },
        () => {
          carregarListas()
        }
      )
      .subscribe()

    // Subscription para mudanças em compartilhamentos
    const compartilhamentosChannel = supabase
      .channel(`compartilhamentos-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lista_compartilhamentos',
          filter: `user_id=eq.${userId}`
        },
        () => {
          carregarListas()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(listasChannel)
      supabase.removeChannel(compartilhamentosChannel)
    }
  }, [userId])

  async function carregarListas() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("listas")
      .select("*")
      .or(`user_id.eq.${userId},criador_id.eq.${userId}`)
      .order("criada_em", { ascending: false })

    if (!error && data) {
      setListas(data)
    }
    setIsLoading(false)
  }

  async function criarNovaLista() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("listas")
      .insert({ nome: "Nova Lista", user_id: userId, criador_id: userId })
      .select()
      .single()

    if (!error && data) {
      router.push(`/listas/${data.id}`)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shrink-0">
              <ShoppingBasket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-emerald-900 truncate">FeirinhaApp</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <PerfilDialog userId={userId} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground h-10 w-10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900">Minhas Listas</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Organize suas compras e economize</p>
          </div>
          <Button onClick={criarNovaLista} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            <span className="ml-2">Nova Lista</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando suas listas...</p>
          </div>
        ) : listas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma lista ainda</h3>
              <p className="text-muted-foreground mb-6 text-center px-4">
                Crie sua primeira lista de compras e comece a economizar
              </p>
              <Button onClick={criarNovaLista} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-5 w-5" />
                Criar Primeira Lista
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listas.map((lista) => {
              const isCompartilhada = lista.criador_id !== userId
              return (
                <Link key={lista.id} href={`/listas/${lista.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="flex items-start justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="truncate text-base sm:text-lg">{lista.nome}</span>
                          {isCompartilhada && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shrink-0">
                              <Users className="h-3 w-3" />
                              <span className="hidden sm:inline">Compartilhada</span>
                            </span>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </CardTitle>
                      <CardDescription className="text-sm">{new Date(lista.criada_em).toLocaleDateString("pt-BR")}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
