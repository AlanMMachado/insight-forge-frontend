"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2 } from "lucide-react"

export interface CardField {
  label: string
  value: React.ReactNode
  className?: string
  isStatus?: boolean
  statusVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export interface CardAction {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  className?: string
}

export interface MobileDataCardProps {
  title: string
  subtitle?: string
  fields: CardField[]
  actions?: CardAction[]
  className?: string
}

export default function MobileDataCard({ 
  title, 
  subtitle, 
  fields, 
  actions = [], 
  className = "" 
}: MobileDataCardProps) {
  return (
    <Card className={`border-[#FFD300]/20 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-4">
        {/* Header do Card */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1 leading-tight">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Ações */}
          {actions.length > 0 && (
            <div className="flex items-center gap-1 ml-3 flex-shrink-0">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "ghost"}
                  size="sm"
                  onClick={action.onClick}
                  className={`h-8 w-8 p-0 ${action.className || ""}`}
                  title={action.label}
                >
                  {action.icon}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Campos de dados */}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 flex-shrink-0">
                {field.label}:
              </span>
              {field.isStatus && typeof field.value === 'string' ? (
                <Badge 
                  variant={field.statusVariant || "default"} 
                  className={`text-xs ${field.className || ""}`}
                >
                  {field.value}
                </Badge>
              ) : (
                <div className={`text-sm text-right ml-2 flex-1 min-w-0 ${field.className || ""}`}>
                  {field.value}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Componentes de ação pré-definidos para facilitar o uso
export const createDefaultActions = {
  view: (onClick: () => void) => ({
    icon: <Eye className="w-4 h-4" />,
    label: "Visualizar",
    onClick,
    className: "hover:bg-blue-100 hover:text-blue-700"
  }),
  
  edit: (onClick: () => void) => ({
    icon: <Edit className="w-4 h-4" />,
    label: "Editar", 
    onClick,
    className: "hover:bg-[#FFD300]/30 hover:text-[#0C0C0C]"
  }),
  
  delete: (onClick: () => void) => ({
    icon: <Trash2 className="w-4 h-4" />,
    label: "Excluir",
    onClick,
    variant: "ghost" as const,
    className: "text-red-600 hover:text-red-700 hover:bg-red-100"
  })
}