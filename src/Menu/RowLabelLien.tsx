'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabelLien: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ intitule?: string }>()
  const n = data?.rowNumber !== undefined ? data.rowNumber + 1 : ''
  return <div>{data?.data?.intitule ? data.data.intitule : `Lien ${n}`}</div>
}
