export interface Patient {
  id: string
  name: string
  phone: string
  createdAt: string
}

export interface MassageType {
  id: string
  name: string
  duration: number // em minutos
  price: number
}

export interface Appointment {
  id: string
  patientId: string
  massageTypeId: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  paymentMethod?: 'pix' | 'cash' | 'credit' | 'debit' | null
  createdAt: string
}

export type PaymentMethod = 'pix' | 'cash' | 'credit' | 'debit'
