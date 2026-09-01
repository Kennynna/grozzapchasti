import { CreateMarkModal } from '@/components/admin/CreateMarkForm'
import { CreateModelModal } from '@/components/admin/CreateModelForm'
import { EntitySelect } from '@/components/admin/EntitySelect'
import { AdminFieldLabel } from '@/components/admin/AdminFieldLabel'
import { Field } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PartFit } from '@/lib/part-fit'
import type { Mark, Model } from '@/queries'
import { useState } from 'react'

type PartFitFieldsProps = {
  fit: PartFit
  markId?: number
  modelId?: number
  marks: Mark[]
  models: Model[]
  idPrefix: string
  onFitChange: (fit: PartFit) => void
  onMarkChange: (id: number | undefined) => void
  onModelChange: (id: number | undefined) => void
}

export function PartFitFields({
  fit,
  markId,
  modelId,
  marks,
  models,
  idPrefix,
  onFitChange,
  onMarkChange,
  onModelChange,
}: PartFitFieldsProps) {
  const [markModalOpen, setMarkModalOpen] = useState(false)
  const [modelModalOpen, setModelModalOpen] = useState(false)
  const ofMark = models.filter((model) => (markId ? model.markId === markId : false))

  return (
    <>
      <Field>
        <AdminFieldLabel htmlFor={`${idPrefix}-fit`} required>
          Применимость
        </AdminFieldLabel>
        <Select
          value={fit}
          onValueChange={(next) => {
            const value = next as PartFit
            onFitChange(value)
            if (value === 'all') {
              onMarkChange(undefined)
              onModelChange(undefined)
            }
            if (value === 'mark') {
              onModelChange(undefined)
            }
          }}
        >
          <SelectTrigger id={`${idPrefix}-fit`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="auto">Эта модель</SelectItem>
            <SelectItem value="mark">Все модели марки</SelectItem>
            <SelectItem value="all">Все автомобили</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {fit !== 'all' ? (
        <Field>
          <AdminFieldLabel htmlFor={`${idPrefix}-mark`} required>
            Марка
          </AdminFieldLabel>
          <EntitySelect
            id={`${idPrefix}-mark`}
            items={marks}
            value={markId}
            onChange={(id) => {
              onMarkChange(id)
              onModelChange(undefined)
            }}
            onAdd={() => setMarkModalOpen(true)}
            placeholder="Выберите марку"
          />
        </Field>
      ) : null}
      {fit === 'auto' ? (
        <Field>
          <AdminFieldLabel htmlFor={`${idPrefix}-model`} required>
            Модель
          </AdminFieldLabel>
          <EntitySelect
            id={`${idPrefix}-model`}
            items={ofMark}
            value={modelId}
            onChange={onModelChange}
            onAdd={() => setModelModalOpen(true)}
            placeholder={markId ? 'Выберите модель' : 'Сначала марка'}
            disabled={!markId}
          />
        </Field>
      ) : null}
      <CreateMarkModal
        open={markModalOpen}
        onOpenChange={setMarkModalOpen}
        onCreated={(mark) => {
          onMarkChange(mark.id)
          onModelChange(undefined)
        }}
      />
      <CreateModelModal
        open={modelModalOpen}
        onOpenChange={setModelModalOpen}
        defaultMarkId={markId}
        onCreated={(model) => {
          onFitChange('auto')
          onMarkChange(model.markId)
          onModelChange(model.id)
        }}
      />
    </>
  )
}
