import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ListasView } from "@/components/listas-view"

export default async function ListasPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <ListasView userId={data.user.id} />
}
