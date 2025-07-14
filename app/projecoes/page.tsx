import { ProjectionsHeader } from "@/components/projections-header"
import { ProjectionsCharts } from "@/components/projections-charts"

export default function ProjecoesPage() {
  return (
    <div className="p-6 space-y-6">
      <ProjectionsHeader />
      <ProjectionsCharts />
    </div>
  )
}
