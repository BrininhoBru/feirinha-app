import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ListaDetalhes } from "@/components/lista-detalhes"

export default async function ListaDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <ListaDetalhes listaId={id} userId={data.user.id} />
}
