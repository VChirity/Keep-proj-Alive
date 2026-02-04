"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Sparkles, Loader2 } from "lucide-react"
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
import { MassageType } from "@/lib/types"
import { getMassageTypes, saveMassageType, updateMassageType, deleteMassageType } from "@/lib/data-service"

export function MassageTypesTab() {
  const [types, setTypes] = useState<MassageType[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingType, setEditingType] = useState<MassageType | null>(null)
  const [name, setName] = useState("")
  const [duration, setDuration] = useState("")
  const [price, setPrice] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const loadTypes = useCallback(async () => {
    setIsLoading(true)
    const data = await getMassageTypes()
    setTypes(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadTypes()
  }, [loadTypes])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const data = {
        name,
        duration: parseInt(duration),
        price: parseFloat(price.replace(",", ".")),
      }

      if (editingType) {
        const updated = await updateMassageType(editingType.id, data)
        if (updated) {
          setTypes(types.map(t => t.id === updated.id ? updated : t))
        }
      } else {
        const newType = await saveMassageType(data)
        if (newType) {
          setTypes([...types, newType])
        }
      }
      
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (type: MassageType) => {
    setEditingType(type)
    setName(type.name)
    setDuration(type.duration.toString())
    setPrice(type.price.toString())
    setIsOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tipo de massagem?")) {
      const success = await deleteMassageType(id)
      if (success) {
        setTypes(types.filter(t => t.id !== id))
      }
    }
  }

  const resetForm = () => {
    setName("")
    setDuration("")
    setPrice("")
    setEditingType(null)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-lavender" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-lavender-light rounded-xl">
            <Sparkles className="h-6 w-6 text-lavender" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Tipos de Massagem</h2>
            <p className="text-muted-foreground">Configure os servicos e valores</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open) }}>
          <DialogTrigger asChild>
            <Button className="bg-lavender hover:bg-lavender/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingType ? "Editar Tipo de Massagem" : "Novo Tipo de Massagem"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Massagem Relaxante"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duracao (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60"
                    min="15"
                    step="15"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Valor (R$)</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120,00"
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
                  {editingType ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {types.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-lavender-light p-4 mb-4">
            <Sparkles className="h-8 w-8 text-lavender" />
          </div>
          <h3 className="font-medium">Nenhum tipo cadastrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre os tipos de massagem que voce oferece
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Duracao</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[100px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.duration} min</TableCell>
                  <TableCell>{formatCurrency(type.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(type)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(type.id)}
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
