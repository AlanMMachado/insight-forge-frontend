import { ReportsHeader } from "@/components/reports-header"
import { ReportsGrid } from "@/components/reports-grid"

export default function RelatoriosPage() {
  return (
    <div className="p-6 space-y-6">
      <ReportsHeader />
      <ReportsGrid />
    </div>
  )
}
