import create from '@/utils/request'

export interface Category {
  id: string
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
    data: { type }
  })
}

export async function categorySave(data: CategorySaveParams) {
  return create<Category>({
    url: '/category/save',
    method: 'POST',
    data
  })
}

export async function categoryUpdate(id: string, data: CategorySaveParams) {
  return create<Category>({
    url: `/category/update/${id}`,
    method: 'PUT',
    data
  })
}

export async function categoryDelete(id: string) {
  return create({
    url: `/category/delete/${id}`,
    method: 'DELETE'
  })
}
