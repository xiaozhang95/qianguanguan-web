import create from '@/utils/request'
import type { CtmResponse } from '@/utils/request'

export interface BillVO {
  id: number
  userId: number
  categoryId: number
  categoryName: string
  categoryIcon: string
  type: string
  amount: number
  billDate: string
  remark: string
  createtime: string
}

export interface BillSaveParams {
  categoryId: number
  type: string
  amount: number
  billDate: string
  remark?: string
}

export interface BillListParams {
  type?: string
  categoryId?: number
  startDate?: string
  endDate?: string
  pageNum?: number
  pageSize?: number
}

export interface BillPage {
  records: BillVO[]
  total: number
  size: number
  current: number
}

export interface BillStats {
  totalIncome: number
  totalExpense: number
  balance: number
}

export async function billList(params: BillListParams) {
  return create<BillPage>({
    url: '/bill/list',
    method: 'POST',
    data: params
  })
}

export async function billSave(data: BillSaveParams) {
  return create<BillVO>({
    url: '/bill',
    method: 'POST',
    data
  })
}

export async function billUpdate(id: number, data: BillSaveParams) {
  return create<BillVO>({
    url: `/bill/${id}`,
    method: 'PUT',
    data
  })
}

export async function billDelete(id: number) {
  return create<CtmResponse<null>>({
    url: `/bill/${id}`,
    method: 'DELETE'
  })
}

export async function billStats(year: string, month: string) {
  return create<BillStats>({
    url: '/bill/stats',
    method: 'POST',
    data: { year, month }
  })
}
