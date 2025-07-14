"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { MetricsGrid } from "@/components/metrics-grid"
import { ChartsGrid } from "@/components/charts-grid"
import { DataTable } from "@/components/data-table"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <DashboardHeader />
      <MetricsGrid isLoading={isLoading} />
      <ChartsGrid isLoading={isLoading} />
      <DataTable isLoading={isLoading} />
    </div>
  )
}
