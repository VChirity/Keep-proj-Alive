"use client"

import { useEffect, useState, useCallback } from "react"
import React from "react"
import { Plus, Pencil, Trash2, Phone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Patient } from "@/lib/types"
import { getPatients, savePatient, updatePatient, deletePatient } from "@/lib/data-service"

export function PatientsTab() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadPatients = useCallback(async () => {
    setIsLoading(true)
    const data = await getPatients()
    setPatients(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    
    let formatted = numbers
    if (!formatted.startsWith("55") && formatted.length > 0) {
      formatted = "55" + formatted
    }
    
    formatted = formatted.slice(0, 13)
    
    if (formatted.length > 0) {
      let result = "+"
      if (formatted.length > 0) result += formatted.slice(0, 2)
      if (formatted.length > 2) result += " (" + formatted.slice(2, 4)
      if (formatted.length > 4) result += ") " + formatted.slice(4, 9)
      if (formatted.length > 9) result += "-" + formatted.slice(9)
      return result
    }
    return ""
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneInput(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      if (editingPatient) {
        const updated = await updatePatient(editingPatient.id, { name, phone })
        if (updated) {
          setPatients(patients.map(p => p.id === updated.id ? updated : p))
        }
      } else {
        const newPatient = await savePatient({ name, phone })
        if (newPatient) {
          setPatients([...patients, newPatient])
        }
      }
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setName(patient.name)
    setPhone(patient.phone)
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este paciente?")) {
      const success = await deletePatient(id)
      if (success) {
        setPatients(patients.filter(p => p.id !== id))
      }
    }
  }

  const resetForm = () => {
    setName("")
    setPhone("")
    setEditingPatient(null)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-turquoise" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-turquoise-light rounded-xl">
            <Phone className="h-6 w-6 text-turquoise" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Pacientes</h2>
            <p className="text-muted-foreground">Gerencie seus pacientes</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open) }}>
          <DialogTrigger asChild>
            <Button className="bg-turquoise hover:bg-turquoise/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Editar Paciente" : "Novo Paciente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+55 (11) 99999-9999"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPatient ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-turquoise-light p-4 mb-4">
            <Phone className="h-8 w-8 text-turquoise" />
          </div>
          <h3 className="font-medium">Nenhum paciente cadastrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Comece cadastrando seu primeiro paciente
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="w-[100px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(patient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(patient.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
