import { useQuery } from '@tanstack/react-query'
import { apiUrls } from '@/api/config/endpoints'
import { axios } from '@/shared/lib/axios'
import { ALL_ITEMS, toPagedQuery } from './common'

// ===========================================
// TYPES (Identity: DepartmentDto, PositionDto)
// ===========================================

export interface Department {
  id: number
  name: string
  description: string | null
}

export interface Position {
  id: number
  name: string
  description: string | null
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const getDepartments = async () => {
  const res = await axios.get<{ departments: Department[]; totalCount: number }>(
    apiUrls.department.list,
    { params: toPagedQuery(ALL_ITEMS) }
  )
  return res.data.departments
}

export const getPositions = async () => {
  const res = await axios.get<{ positions: Position[]; totalCount: number }>(
    apiUrls.position.list,
    { params: toPagedQuery(ALL_ITEMS) }
  )
  return res.data.positions
}

// ===========================================
// CUSTOM HOOKS
// ===========================================

export const useDepartments = () =>
  useQuery({ queryKey: ['departments'], queryFn: getDepartments, staleTime: 5 * 60 * 1000 })

export const usePositions = () =>
  useQuery({ queryKey: ['positions'], queryFn: getPositions, staleTime: 5 * 60 * 1000 })
