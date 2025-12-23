"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { 
  Plus, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBasket, 
  Trash2, 
  Share2, 
  Users, 
  Edit2, 
  MoreVertical 
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Lista {
  id: string
  nome: string
  user_id: string
  criador_id: string
}

interface Compartilhamento {
  id: string
  user_id: string
  compartilhada_em: string
}

interface ItemLista {
  id: string
  produto_id: string
  quantidade: number
  unidade: string
  marca: string
  preco: number
  checked: boolean
  produtos: {
    nome: string
  }
}

interface HistoricoPreco {
  preco: number
  data_registro: string
  marca: string
}

export function ListaDetalhes({ listaId, userId }: { listaId: string; userId: string }) {
  const [lista, setLista] = useState<Lista | null>(null)
  const [itens, setItens] = useState<ItemLista[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [novoNomeLista, setNovoNomeLista] = useState("")
  const [nomeProduto, setNomeProduto] = useState("")
  const [quantidade, setQuantidade] = useState("1")
  const [unidade, setUnidade] = useState("un")
  const [marca, setMarca] = useState("")
  const [preco, setPreco] = useState("")
  const [emailCompartilhar, setEmailCompartilhar] = useState("")
  const [compartilhamentos, setCompartilhamentos] = useState<Compartilhamento[]>([])
  const [comparacaoPrecos, setComparacaoPrecos] = useState<Record<string, { ultimoPreco: number; variacao: number }>>(
    {},
  )
  const router = useRouter()

  useEffect(() => {
    carregarLista()
    carregarItens()
    carregarCompartilhamentos()

    // Configurar subscriptions em tempo real
    const supabase = createClient()
    
    // Subscription para mudanças na lista
    const listaChannel = supabase
      .channel(`lista-${listaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listas',
          filter: `id=eq.${listaId}`
        },
        () => {
          carregarLista()
        }
      )
      .subscribe()

    // Subscription para mudanças nos itens
    const itensChannel = supabase
      .channel(`itens-${listaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itens_lista',
          filter: `lista_id=eq.${listaId}`
        },
        () => {
          carregarItens()
        }
      )
      .subscribe()

    // Subscription para compartilhamentos
    const compartilhamentosChannel = supabase
      .channel(`compartilhamentos-${listaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lista_compartilhamentos',
          filter: `lista_id=eq.${listaId}`
        },
        () => {
          carregarCompartilhamentos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(listaChannel)
      supabase.removeChannel(itensChannel)
      supabase.removeChannel(compartilhamentosChannel)
    }
  }, [listaId])

  async function carregarLista() {
    const supabase = createClient()
    const { data } = await supabase.from("listas").select("*").eq("id", listaId).single()

    if (data) {
      setLista(data)
    }
  }

  async function carregarItens() {
    const supabase = createClient()
    const { data } = await supabase
      .from("itens_lista")
      .select("*, produtos(nome)")
      .eq("lista_id", listaId)
      .order("checked", { ascending: true })
      .order("created_at", { ascending: false })

    if (data) {
      setItens(data as ItemLista[])
      await carregarComparacaoPrecos(data as ItemLista[])
    }
  }

  async function carregarComparacaoPrecos(itensAtuais: ItemLista[]) {
    const supabase = createClient()
    const comparacoes: Record<string, { ultimoPreco: number; variacao: number }> = {}

    for (const item of itensAtuais) {
      if (item.preco && item.marca) {
        const { data } = await supabase
          .from("historico_precos")
          .select("preco, data_registro, marca")
          .eq("produto_id", item.produto_id)
          .eq("marca", item.marca)
          .eq("user_id", userId)
          .order("data_registro", { ascending: false })
          .limit(2)

        if (data && data.length > 1) {
          const precoAtual = item.preco
          const precoAnterior = data[1].preco
          const variacao = ((precoAtual - precoAnterior) / precoAnterior) * 100
          comparacoes[item.id] = { ultimoPreco: precoAnterior, variacao }
        }
      }
    }

    setComparacaoPrecos(comparacoes)
  }

  async function carregarCompartilhamentos() {
    const supabase = createClient()
    const { data } = await supabase
      .from("lista_compartilhamentos")
      .select("*")
      .eq("lista_id", listaId)

    if (data) {
      setCompartilhamentos(data)
    }
  }

  async function compartilharLista() {
    if (!emailCompartilhar.trim()) return

    const supabase = createClient()

    // Buscar usuário pelo email
    const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers()
    
    // Como não temos acesso admin na aplicação, vamos usar uma abordagem alternativa
    // Precisamos que o usuário insira o ID do usuário com quem quer compartilhar
    // Ou criar uma tabela de usuários públicos com emails visíveis
    
    // Por enquanto, vamos assumir que emailCompartilhar é na verdade um user_id
    const userIdCompartilhar = emailCompartilhar.trim()

    // Verificar se já não está compartilhado
    const { data: existente } = await supabase
      .from("lista_compartilhamentos")
      .select("id")
      .eq("lista_id", listaId)
      .eq("user_id", userIdCompartilhar)
      .single()

    if (existente) {
      alert("Lista já compartilhada com este usuário")
      return
    }

    // Criar compartilhamento
    const { error } = await supabase
      .from("lista_compartilhamentos")
      .insert({
        lista_id: listaId,
        user_id: userIdCompartilhar
      })

    if (!error) {
      setEmailCompartilhar("")
      setIsShareDialogOpen(false)
      carregarCompartilhamentos()
    } else {
      alert("Erro ao compartilhar lista. Verifique o ID do usuário.")
    }
  }

  async function removerCompartilhamento(compartilhamentoId: string) {
    const supabase = createClient()
    await supabase.from("lista_compartilhamentos").delete().eq("id", compartilhamentoId)
    carregarCompartilhamentos()
  }

  async function editarNomeLista() {
    if (!lista || !novoNomeLista.trim()) return
    
    // Apenas o criador pode editar o nome
    if (lista.criador_id !== userId) {
      toast.error("Apenas o criador pode editar o nome desta lista")
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("listas")
      .update({ nome: novoNomeLista.trim() })
      .eq("id", listaId)

    if (error) {
      toast.error("Erro ao atualizar o nome da lista")
      console.error("Erro ao atualizar lista:", error)
    } else {
      toast.success("Nome da lista atualizado com sucesso")
      setIsEditDialogOpen(false)
      carregarLista()
    }
  }

  async function excluirLista() {
    if (!lista) return
    
    // Apenas o criador pode excluir
    if (lista.criador_id !== userId) {
      toast.error("Apenas o criador pode excluir esta lista")
      return
    }

    if (!confirm("Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita.")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("listas").delete().eq("id", listaId)

    if (error) {
      toast.error("Erro ao excluir a lista")
      console.error("Erro ao excluir lista:", error)
      return
    }

    toast.success("Lista excluída com sucesso")
    router.push("/listas")
  }

  async function adicionarItem() {
    if (!nomeProduto.trim()) return

    const supabase = createClient()

    // Buscar ou criar produto
    const { data: produtoExistente } = await supabase
      .from("produtos")
      .select("id")
      .ilike("nome", nomeProduto.trim())
      .limit(1)
      .single()

    let produtoId = produtoExistente?.id

    if (!produtoId) {
      const { data: novoProduto } = await supabase
        .from("produtos")
        .insert({ nome: nomeProduto.trim() })
        .select("id")
        .single()
      produtoId = novoProduto?.id
    }

    if (produtoId) {
      // Adicionar item à lista
      await supabase.from("itens_lista").insert({
        lista_id: listaId,
        produto_id: produtoId,
        quantidade: Number.parseFloat(quantidade) || 1,
        unidade: unidade,
        marca: marca.trim() || null,
        preco: preco ? Number.parseFloat(preco) : null,
      })

      // Registrar no histórico de preços
      if (preco && marca.trim()) {
        await supabase.from("historico_precos").insert({
          produto_id: produtoId,
          marca: marca.trim(),
          preco: Number.parseFloat(preco),
          user_id: userId,
        })
      }

      // Limpar formulário
      setNomeProduto("")
      setQuantidade("1")
      setUnidade("un")
      setMarca("")
      setPreco("")
      setIsDialogOpen(false)

      carregarItens()
    }
  }

  async function toggleItem(itemId: string, checked: boolean) {
    const supabase = createClient()
    await supabase.from("itens_lista").update({ checked }).eq("id", itemId)
    carregarItens()
  }

  async function removerItem(itemId: string) {
    const supabase = createClient()
    await supabase.from("itens_lista").delete().eq("id", itemId)
    carregarItens()
  }

  const total = itens.reduce((acc, item) => {
    return acc + (item.preco ? item.preco * item.quantidade : 0)
  }, 0)

  const itensChecked = itens.filter((item) => item.checked).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-emerald-900">
              <Link href="/listas">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
              <ShoppingBasket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                {lista?.nome || "Carregando..."}
                {compartilhamentos.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Compartilhada
                  </span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground">
                {itensChecked} de {itens.length} itens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lista?.criador_id === userId && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="text-emerald-600 hover:bg-emerald-50">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setNovoNomeLista(lista?.nome || "")
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar Nome
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={excluirLista}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Lista
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Compartilhar Lista</DialogTitle>
                      <DialogDescription>
                        Compartilhe esta lista com outros usuários. Eles poderão ver e editar os itens.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="userId">ID do Usuário</Label>
                        <Input
                          id="userId"
                          placeholder="Cole o ID do usuário aqui"
                          value={emailCompartilhar}
                          onChange={(e) => setEmailCompartilhar(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          O usuário precisa fornecer seu ID para compartilhamento
                        </p>
                      </div>
                      {compartilhamentos.length > 0 && (
                        <div className="grid gap-2">
                          <Label>Usuários com acesso</Label>
                          <div className="space-y-2">
                            {compartilhamentos.map((comp) => (
                              <div
                                key={comp.id}
                                className="flex items-center justify-between p-2 bg-muted rounded-md"
                              >
                                <span className="text-sm truncate">{comp.user_id}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removerCompartilhamento(comp.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Remover
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={compartilharLista}
                      className="bg-emerald-600 hover:bg-emerald-700 w-full"
                      disabled={!emailCompartilhar.trim()}
                    >
                      Compartilhar
                    </Button>
                  </DialogContent>
                </Dialog>
              </>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-5 w-5" />
                  Adicionar
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Item</DialogTitle>
                <DialogDescription>Adicione um produto à sua lista de compras</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="produto">Produto *</Label>
                  <Input
                    id="produto"
                    placeholder="Ex: Arroz, Feijão, Leite..."
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Select value={unidade} onValueChange={setUnidade}>
                      <SelectTrigger id="unidade">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">un (unidade)</SelectItem>
                        <SelectItem value="kg">kg (quilograma)</SelectItem>
                        <SelectItem value="g">g (gramas)</SelectItem>
                        <SelectItem value="L">L (litro)</SelectItem>
                        <SelectItem value="mL">mL (mililitro)</SelectItem>
                        <SelectItem value="caixa">caixa</SelectItem>
                        <SelectItem value="pacote">pacote</SelectItem>
                        <SelectItem value="fardo">fardo</SelectItem>
                        <SelectItem value="dz">dz (dúzia)</SelectItem>
                        <SelectItem value="bandeja">bandeja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    placeholder="Ex: Tio João, Camil..."
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={adicionarItem}
                className="bg-emerald-600 hover:bg-emerald-700 w-full"
                disabled={!nomeProduto.trim()}
              >
                Adicionar à Lista
              </Button>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {total > 0 && (
          <Card className="mb-6 bg-emerald-600 text-white border-emerald-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-emerald-100 mb-1">Total Estimado</p>
                <p className="text-4xl font-bold">R$ {total.toFixed(2).replace(".", ",")}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {itens.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBasket className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lista vazia</h3>
              <p className="text-muted-foreground mb-6 text-center">Adicione produtos à sua lista de compras</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-5 w-5" />
                Adicionar Primeiro Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {itens.map((item) => {
              const comparacao = comparacaoPrecos[item.id]
              return (
                <Card key={item.id} className={`transition-all ${item.checked ? "opacity-60 bg-muted/50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                        className="mt-1 border-emerald-600 data-[state=checked]:bg-emerald-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${item.checked ? "line-through" : ""}`}>
                              {item.produtos.nome}
                            </h3>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                              <span>
                                {item.quantidade} {item.unidade}
                              </span>
                              {item.marca && <span>• {item.marca}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {item.preco && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-lg font-bold text-emerald-700">
                              R$ {item.preco.toFixed(2).replace(".", ",")}
                            </span>
                            {comparacao && (
                              <div
                                className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                                  comparacao.variacao > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                }`}
                              >
                                {comparacao.variacao > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                <span>
                                  {comparacao.variacao > 0 ? "+" : ""}
                                  {comparacao.variacao.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Dialog para editar nome da lista */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Nome da Lista</DialogTitle>
            <DialogDescription>
              Altere o nome da sua lista de compras
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nomeLista">Nome da Lista</Label>
              <Input
                id="nomeLista"
                placeholder="Digite o novo nome da lista"
                value={novoNomeLista}
                onChange={(e) => setNovoNomeLista(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && novoNomeLista.trim()) {
                    editarNomeLista()
                  }
                }}
              />
            </div>
          </div>
          <Button
            onClick={editarNomeLista}
            className="bg-emerald-600 hover:bg-emerald-700 w-full"
            disabled={!novoNomeLista.trim()}
          >
            Salvar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
