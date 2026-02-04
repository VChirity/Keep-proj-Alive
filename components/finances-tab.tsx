"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, TrendingUp, Wallet, CreditCard, Banknote, Smartphone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Appointment, Patient, MassageType } from "@/lib/types"
import { getAppointments, getPatients, getMassageTypes } from "@/lib/data-service"

export function FinancesTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [massageTypes, setMassageTypes] = useState<MassageType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const [appointmentsData, patientsData, typesData] = await Promise.all([
      getAppointments(),
      getPatients(),
      getMassageTypes(),
    ])
    setAppointments(appointmentsData)
    setPatients(patientsData)
    setMassageTypes(typesData)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const monthlyData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const completedAppointments = appointments.filter((a) => {
      const date = new Date(a.date)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        a.status === "completed" &&
        a.paymentMethod
      )
    })

    const totalRevenue = completedAppointments.reduce((total, a) => {
      const type = massageTypes.find((t) => t.id === a.massageTypeId)
      return total + (type?.price || 0)
    }, 0)

    const paymentStats = {
      pix: 0,
      cash: 0,
      credit: 0,
      debit: 0,
    }

    completedAppointments.forEach((a) => {
      const type = massageTypes.find((t) => t.id === a.massageTypeId)
      if (a.paymentMethod && type) {
        paymentStats[a.paymentMethod] += type.price
      }
    })

    return {
      completedAppointments,
      totalRevenue,
      paymentStats,
      totalAppointments: completedAppointments.length,
    }
  }, [currentMonth, appointments, massageTypes])

  const getPatientById = (id: string) => patients.find((p) => p.id === id)
  const getMassageTypeById = (id: string) => massageTypes.find((t) => t.id === id)

  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]

  const paymentMethodLabels = {
    pix: { label: "PIX", icon: Smartphone, color: "text-turquoise", bg: "bg-turquoise-light" },
    cash: { label: "Dinheiro", icon: Banknote, color: "text-mint", bg: "bg-mint-light" },
    credit: { label: "Credito", icon: CreditCard, color: "text-lavender", bg: "bg-lavender-light" },
    debit: { label: "Debito", icon: Wallet, color: "text-coral", bg: "bg-coral-light" },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mint" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mint-light rounded-xl">
            <Wallet className="h-6 w-6 text-mint" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Financeiro</h2>
            <p className="text-muted-foreground">Acompanhe seus recebimentos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-mint to-turquoise text-foreground border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              Total do Mes
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(monthlyData.totalRevenue)}
            </div>
            <p className="text-sm text-foreground/70 mt-1">
              {monthlyData.totalAppointments} atendimento{monthlyData.totalAppointments !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {(Object.entries(monthlyData.paymentStats) as [keyof typeof paymentMethodLabels, number][]).map(
          ([method, value]) => {
            const { label, icon: Icon, color, bg } = paymentMethodLabels[method]
            return (
              <Card key={method} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${color}`}>
                    {formatCurrency(value)}
                  </div>
                </CardContent>
              </Card>
            )
          }
        )}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos Concluidos</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.completedAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-mint-light rounded-full mb-3">
                <Wallet className="h-8 w-8 text-mint" />
              </div>
              <p className="text-muted-foreground">Nenhum atendimento concluido neste mes</p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Servico</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.completedAppointments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((appointment) => {
                      const patient = getPatientById(appointment.patientId)
                      const massageType = getMassageTypeById(appointment.massageTypeId)
                      const paymentInfo = appointment.paymentMethod
                        ? paymentMethodLabels[appointment.paymentMethod]
                        : null

                      return (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {new Date(appointment.date + "T12:00:00").toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-medium">{patient?.name}</TableCell>
                          <TableCell>{massageType?.name}</TableCell>
                          <TableCell>
                            {paymentInfo && (
                              <span className={`flex items-center gap-1 ${paymentInfo.color}`}>
                                <paymentInfo.icon className="h-3 w-3" />
                                {paymentInfo.label}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {massageType && formatCurrency(massageType.price)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
