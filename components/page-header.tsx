"use client"

import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description: string
  icon: ReactNode
  badge?: {
    label: string
    variant?: 'live' | 'default'
  }
  actions?: ReactNode
  padding?: 'compact' | 'normal'
}

/**
 * Componente reutilizável para headers de páginas
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   icon={<Package className="h-8 w-8 text-[#0C0C0C]" />}
 *   title="Produtos"
 *   description="Gerencie seu catálogo de produtos"
 *   actions={
 *     <>
 *       <Button>Importar</Button>
 *       <Button>Novo</Button>
 *     </>
 *   }
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  icon,
  badge,
  actions,
  padding = 'normal',
}: PageHeaderProps) {
  const paddingClass = padding === 'compact' ? 'p-4 sm:p-6' : 'p-6'

  return (
    <div className={`bg-gradient-to-r from-white to-[#FFFDF0] ${paddingClass} rounded-2xl border border-[#FFD300]/20 shadow-sm`}>
      <div className={`flex flex-col sm:flex-row items-start sm:items-center ${actions ? 'justify-between' : ''} gap-4`}>
        {/* Icon + Text Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {/* Icon Container */}
          <div className="p-3 bg-gradient-to-br from-[#FFD300] to-[#E6BD00] rounded-xl shadow-md flex-shrink-0">
            {icon}
          </div>

          {/* Text Content */}
          <div>
            {/* Title + Badge Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C0C0C]">
                {title}
              </h1>

              {badge && (
                <Badge 
                  className={`${
                    badge.variant === 'live'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm'
                      : 'bg-[#FFD300]/20 text-[#0C0C0C] border-[#FFD300]/30'
                  }`}
                >
                  {badge.variant === 'live' && (
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  )}
                  {badge.label}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FFD300] rounded-full flex-shrink-0"></span>
              {description}
            </p>
          </div>
        </div>

        {/* Actions Slot */}
        {actions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
