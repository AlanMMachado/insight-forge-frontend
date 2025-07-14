import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SettingsForm() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-[#000000] mb-4">Configurações Gerais</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="company" className="text-[#000000] font-medium">
              Nome da Empresa
            </Label>
            <Input id="company" placeholder="Digite o nome da empresa" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="email" className="text-[#000000] font-medium">
              Email de Notificações
            </Label>
            <Input id="email" type="email" placeholder="email@empresa.com" className="mt-2" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-[#000000] mb-4">Notificações</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#000000] font-medium">Estoque Baixo</Label>
              <p className="text-sm text-[#9A9A9A]">Receber alertas quando o estoque estiver baixo</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[#000000] font-medium">Relatórios Semanais</Label>
              <p className="text-sm text-[#9A9A9A]">Receber relatórios automáticos por email</p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      <Button className="bg-[#FFD300] text-[#0C0C0C] hover:bg-[#E6BD00] font-medium">Salvar Configurações</Button>
    </div>
  )
}
