import create from '@/utils/request'
import type { CtmResponse } from '@/utils/request'

export interface Category {
  id: number
  name: string
  icon: string
  type: string
  sort: number
  createtime: string
}

export interface CategorySaveParams {
  name: string
  icon: string
  type: string
  sort: number
}

export async function categoryList(type?: string) {
  return create<Category[]>({
    url: '/category/list',
    method: 'POST',
    data: { type },
    errorMsg: true
  })
}

export async function categorySave(data: CategorySaveParams) {
  return create<Category>({
    url: '/category',
    method: 'POST',
    data,
    errorMsg: true
  })
}

export async function categoryUpdate(id: number, data: CategorySaveParams) {
  return create<Category>({
    url: `/category/${id}`,
    method: 'PUT',
    data,
    errorMsg: true
  })
}

export async function categoryDelete(id: number) {
  return create<CtmResponse<null>>({
    url: `/category/${id}`,
    method: 'DELETE',
    errorMsg: true
  })
}
