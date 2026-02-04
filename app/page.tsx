"use client"

import { useState } from "react"
import { Calendar, Users, Sparkles, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { PatientsTab } from "@/components/patients-tab"
import { MassageTypesTab } from "@/components/massage-types-tab"
import { ScheduleTab } from "@/components/schedule-tab"
import { FinancesTab } from "@/components/finances-tab"

type Tab = "schedule" | "patients" | "massages" | "finances"

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule")

  const tabs = [
    { id: "schedule" as const, label: "Agenda", icon: Calendar },
    { id: "patients" as const, label: "Pacientes", icon: Users },
    { id: "massages" as const, label: "Serviços", icon: Sparkles },
    { id: "finances" as const, label: "Financeiro", icon: Wallet },
  ]

  const tabColors = {
    schedule: "bg-coral text-white",
    patients: "bg-turquoise text-white",
    massages: "bg-lavender text-white",
    finances: "bg-mint text-foreground",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-coral to-lavender text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Massagem da Lu</h1>
              <p className="text-sm text-white/80">Sistema de gestão</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? tabColors[tab.id]
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "patients" && <PatientsTab />}
        {activeTab === "massages" && <MassageTypesTab />}
        {activeTab === "finances" && <FinancesTab />}
      </main>
    </div>
  )
}
