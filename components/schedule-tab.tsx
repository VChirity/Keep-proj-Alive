"use client"

import React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Ban,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Patient, MassageType, Appointment, PaymentMethod } from "@/lib/types"
import {
  getPatients,
  getMassageTypes,
  getAppointments,
  saveAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/lib/data-service"

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export function ScheduleTab() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [massageTypes, setMassageTypes] = useState<MassageType[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [patientId, setPatientId] = useState("")
  const [massageTypeId, setMassageTypeId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  // Complete dialog
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")

  const loadData = useCallback(async () => {
    setIsLoading(true)
    const [patientsData, typesData, appointmentsData] = await Promise.all([
      getPatients(),
      getMassageTypes(),
      getAppointments(),
    ])
    setPatients(patientsData)
    setMassageTypes(typesData)
    setAppointments(appointmentsData)
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments
      .filter((a) => a.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const selectedDateAppointments = useMemo(() => {
    return getAppointmentsForDate(selectedDate)
  }, [selectedDate, appointments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const newAppointment = await saveAppointment({
        patientId,
        massageTypeId,
        date,
        time,
        status: "scheduled",
        paymentMethod: null,
      })

      if (newAppointment) {
        setAppointments([...appointments, newAppointment])
      }
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setPatientId("")
    setMassageTypeId("")
    setDate("")
    setTime("")
    setIsOpen(false)
  }

  const handleComplete = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setPaymentMethod("")
    setCompleteDialogOpen(true)
  }

  const confirmComplete = async () => {
    if (selectedAppointment && paymentMethod) {
      const updated = await updateAppointment(selectedAppointment.id, {
        status: "completed",
        paymentMethod: paymentMethod as PaymentMethod,
      })
      if (updated) {
        setAppointments(appointments.map((a) => (a.id === updated.id ? updated : a)))
      }
      setCompleteDialogOpen(false)
      setSelectedAppointment(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm("Deseja cancelar este agendamento?")) {
      const updated = await updateAppointment(id, { status: "cancelled" })
      if (updated) {
        setAppointments(appointments.map((a) => (a.id === updated.id ? updated : a)))
      }
    }
  }

  const handleNoShow = async (id: string) => {
    if (confirm("Marcar como nao compareceu?")) {
      const updated = await updateAppointment(id, { status: "no-show" })
      if (updated) {
        setAppointments(appointments.map((a) => (a.id === updated.id ? updated : a)))
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Excluir este agendamento permanentemente?")) {
      const success = await deleteAppointment(id)
      if (success) {
        setAppointments(appointments.filter((a) => a.id !== id))
      }
    }
  }

  const openWhatsApp = (patient: Patient) => {
    const phone = patient.phone.replace(/\D/g, "")
    const url = `https://wa.me/${phone}`
    
    // Check if we're in a PWA/standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as Navigator & { standalone?: boolean }).standalone) {
      // Use location.href for PWA to properly open external links
      window.location.href = url
    } else {
      // Use window.open for regular browser
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  const getPatientById = (id: string) => patients.find((p) => p.id === id)
  const getMassageTypeById = (id: string) => massageTypes.find((t) => t.id === id)

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-gold-light text-gold border-gold/30 border">Agendado</Badge>
      case "completed":
        return <Badge className="bg-mint text-foreground">Concluido</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelado</Badge>
      case "no-show":
        return <Badge className="bg-coral-light text-coral">Nao compareceu</Badge>
    }
  }

  const hasAppointments = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return appointments.some((a) => a.date === dateStr && a.status === "scheduled")
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-coral" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-coral-light rounded-xl">
            <Calendar className="h-6 w-6 text-coral" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Agenda</h2>
            <p className="text-muted-foreground">Gerencie seus agendamentos</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              disabled={patients.length === 0 || massageTypes.length === 0}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={patientId} onValueChange={setPatientId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Massagem</Label>
                <Select value={massageTypeId} onValueChange={setMassageTypeId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {massageTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} - {formatCurrency(t.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horario</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Agendar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(patients.length === 0 || massageTypes.length === 0) && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="text-sm">
            {patients.length === 0 && "Cadastre pacientes primeiro. "}
            {massageTypes.length === 0 && "Configure os tipos de massagem primeiro."}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentMonth).map((day, i) => (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && setSelectedDate(day)}
                  className={`
                    relative p-2 text-center text-sm rounded-md transition-colors
                    ${!day ? "invisible" : "hover:bg-muted"}
                    ${day && day.toDateString() === selectedDate.toDateString() ? "bg-coral text-white hover:bg-coral/90" : ""}
                    ${day && day.toDateString() === new Date().toDateString() && day.toDateString() !== selectedDate.toDateString() ? "border-2 border-coral" : ""}
                  `}
                >
                  {day?.getDate()}
                  {day && hasAppointments(day) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-coral rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Day appointments */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>

            {selectedDateAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum agendamento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateAppointments.map((appointment) => {
                  const patient = getPatientById(appointment.patientId)
                  const massageType = getMassageTypeById(appointment.massageTypeId)

                  return (
                    <div
                      key={appointment.id}
                      className="rounded-xl border-2 border-muted p-4 space-y-3 hover:border-coral/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.time}</span>
                          </div>
                          <p className="font-semibold mt-1">{patient?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {massageType?.name} - {massageType && formatCurrency(massageType.price)}
                          </p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {patient && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openWhatsApp(patient)}
                            className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
                          >
                            <WhatsAppIcon />
                            <span className="ml-2">WhatsApp</span>
                          </Button>
                        )}

                        {appointment.status === "scheduled" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleComplete(appointment)}
                              className="bg-mint hover:bg-mint/80 text-foreground"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNoShow(appointment.id)}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Faltou
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(appointment.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}

                        {appointment.status !== "scheduled" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(appointment.id)}
                          >
                            Excluir
                          </Button>
                        )}
                      </div>

                      {appointment.paymentMethod && (
                        <p className="text-xs text-muted-foreground">
                          Pago via: {
                            {
                              pix: "PIX",
                              cash: "Dinheiro",
                              credit: "Credito",
                              debit: "Debito",
                            }[appointment.paymentMethod]
                          }
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Selecione a forma de pagamento para concluir o atendimento.
            </p>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue placeholder="Forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit">Cartao de Credito</SelectItem>
                <SelectItem value="debit">Cartao de Debito</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmComplete} disabled={!paymentMethod}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
