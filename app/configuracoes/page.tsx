import { SettingsHeader } from "@/components/settings-header"
import { SettingsForm } from "@/components/settings-form"

export default function ConfiguracoesPage() {
  return (
    <div className="p-6 space-y-6">
      <SettingsHeader />
      <SettingsForm />
    </div>
  )
}
