// ============================================================
// SERVICO DE DADOS - SUPABASE
// ============================================================

import { createClient } from "@/lib/supabase/client"
import { Patient, MassageType, Appointment, PaymentMethod } from "./types"

// Helper para gerar IDs unicos
export function generateId(): string {
  return crypto.randomUUID()
}

// ============================================================
// PACIENTES
// ============================================================

export async function getPatients(): Promise<Patient[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching patients:", error)
    return []
  }

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    createdAt: p.created_at,
  }))
}

export async function savePatient(
  patient: Omit<Patient, "id" | "createdAt">
): Promise<Patient | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("patients")
    .insert({
      name: patient.name,
      phone: patient.phone,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving patient:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    createdAt: data.created_at,
  }
}

export async function updatePatient(
  id: string,
  data: Partial<Patient>
): Promise<Patient | null> {
  const supabase = createClient()
  const { data: updated, error } = await supabase
    .from("patients")
    .update({
      name: data.name,
      phone: data.phone,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating patient:", error)
    return null
  }

  return {
    id: updated.id,
    name: updated.name,
    phone: updated.phone,
    createdAt: updated.created_at,
  }
}

export async function deletePatient(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("patients").delete().eq("id", id)

  if (error) {
    console.error("Error deleting patient:", error)
    return false
  }

  return true
}

// ============================================================
// TIPOS DE MASSAGEM
// ============================================================

export async function getMassageTypes(): Promise<MassageType[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("massage_types")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching massage types:", error)
    return []
  }

  return data.map((t) => ({
    id: t.id,
    name: t.name,
    duration: t.duration,
    price: Number(t.price),
  }))
}

export async function saveMassageType(
  massageType: Omit<MassageType, "id">
): Promise<MassageType | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("massage_types")
    .insert({
      name: massageType.name,
      duration: massageType.duration,
      price: massageType.price,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving massage type:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    duration: data.duration,
    price: Number(data.price),
  }
}

export async function updateMassageType(
  id: string,
  data: Partial<MassageType>
): Promise<MassageType | null> {
  const supabase = createClient()
  const { data: updated, error } = await supabase
    .from("massage_types")
    .update({
      name: data.name,
      duration: data.duration,
      price: data.price,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating massage type:", error)
    return null
  }

  return {
    id: updated.id,
    name: updated.name,
    duration: updated.duration,
    price: Number(updated.price),
  }
}

export async function deleteMassageType(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("massage_types").delete().eq("id", id)

  if (error) {
    console.error("Error deleting massage type:", error)
    return false
  }

  return true
}

// ============================================================
// AGENDAMENTOS
// ============================================================

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (error) {
    console.error("Error fetching appointments:", error)
    return []
  }

  return data.map((a) => ({
    id: a.id,
    patientId: a.patient_id,
    massageTypeId: a.massage_type_id,
    date: a.date,
    time: a.time,
    status: a.status as Appointment["status"],
    paymentMethod: a.payment_method as PaymentMethod | null,
    createdAt: a.created_at,
  }))
}

export async function saveAppointment(
  appointment: Omit<Appointment, "id" | "createdAt">
): Promise<Appointment | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: appointment.patientId,
      massage_type_id: appointment.massageTypeId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      payment_method: appointment.paymentMethod,
    })
    .select()
    .single()

  if (error) {
    console.error("Error saving appointment:", error)
    return null
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    massageTypeId: data.massage_type_id,
    date: data.date,
    time: data.time,
    status: data.status as Appointment["status"],
    paymentMethod: data.payment_method as PaymentMethod | null,
    createdAt: data.created_at,
  }
}

export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<Appointment | null> {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {}
  if (data.patientId !== undefined) updateData.patient_id = data.patientId
  if (data.massageTypeId !== undefined) updateData.massage_type_id = data.massageTypeId
  if (data.date !== undefined) updateData.date = data.date
  if (data.time !== undefined) updateData.time = data.time
  if (data.status !== undefined) updateData.status = data.status
  if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod

  const { data: updated, error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating appointment:", error)
    return null
  }

  return {
    id: updated.id,
    patientId: updated.patient_id,
    massageTypeId: updated.massage_type_id,
    date: updated.date,
    time: updated.time,
    status: updated.status as Appointment["status"],
    paymentMethod: updated.payment_method as PaymentMethod | null,
    createdAt: updated.created_at,
  }
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("appointments").delete().eq("id", id)

  if (error) {
    console.error("Error deleting appointment:", error)
    return false
  }

  return true
}

// ============================================================
// RELATORIOS
// ============================================================

export async function getMonthlyRevenue(year: number, month: number): Promise<number> {
  const appointments = await getAppointments()
  const massageTypes = await getMassageTypes()

  return appointments
    .filter((a) => {
      const date = new Date(a.date)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        a.status === "completed" &&
        a.paymentMethod
      )
    })
    .reduce((total, a) => {
      const type = massageTypes.find((t) => t.id === a.massageTypeId)
      return total + (type?.price || 0)
    }, 0)
}

export async function getPaymentMethodStats(year: number, month: number) {
  const appointments = await getAppointments()
  const massageTypes = await getMassageTypes()

  const stats = {
    pix: 0,
    cash: 0,
    credit: 0,
    debit: 0,
  }

  appointments
    .filter((a) => {
      const date = new Date(a.date)
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        a.status === "completed" &&
        a.paymentMethod
      )
    })
    .forEach((a) => {
      const type = massageTypes.find((t) => t.id === a.massageTypeId)
      if (a.paymentMethod && type) {
        stats[a.paymentMethod] += type.price
      }
    })

  return stats
}
