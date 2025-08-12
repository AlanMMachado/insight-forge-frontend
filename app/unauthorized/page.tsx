import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <Card className="w-full max-w-md text-center border-[#CFCFCF]">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-[#9A9A9A]">
            Você não tem permissão para acessar esta página. 
            Entre em contato com o administrador se acredita que isso é um erro.
          </p>
          
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="border-[#CFCFCF] text-[#000000] hover:bg-[#F8F8F8]">
              <Link href="/dashboard">
                Voltar ao Dashboard
              </Link>
            </Button>
            <Button asChild className="bg-[#FFD300] hover:bg-[#E6BD00] text-[#000000]">
              <Link href="/login">
                Fazer Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
