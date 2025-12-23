import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ShoppingBasket } from "lucide-react"
import Link from "next/link"

export default function SucessoPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600">
              <ShoppingBasket className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-900">FeirinhaApp</h1>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Verifique seu email</CardTitle>
              <CardDescription className="text-base">
                Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta e começar a usar o
                FeirinhaApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/auth/login">Voltar para login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
