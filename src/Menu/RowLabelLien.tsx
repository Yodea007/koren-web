'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabelLien: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ intitule?: string; groupe?: string }>()
  const n = data?.rowNumber !== undefined ? data.rowNumber + 1 : ''
  const { intitule, groupe } = data?.data ?? {}
  if (!intitule) return <div>{`Lien ${n}`}</div>
  return <div>{groupe ? `${groupe} › ${intitule}` : intitule}</div>
}
