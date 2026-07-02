'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabelSection: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<{ titre?: string }>()
  const n = data?.rowNumber !== undefined ? data.rowNumber + 1 : ''
  return <div>{data?.data?.titre ? `Section : ${data.data.titre}` : `Section ${n}`}</div>
}
