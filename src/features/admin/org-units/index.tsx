import {
  type Department,
  type Position,
  useCreateDepartment,
  useCreatePosition,
  useDeleteDepartment,
  useDeletePosition,
  useDepartmentsPaged,
  usePositionsPaged,
  useUpdateDepartment,
  useUpdatePosition,
} from '../api/lookups'
import { type PagedParams } from '../api/common'
import { OrgUnitPanel } from './components/org-unit-panel'

// Chuẩn hoá phản hồi { departments } / { positions } về { items } cho bảng dùng chung
const useDepartmentList = (params: PagedParams) => {
  const query = useDepartmentsPaged(params)
  return {
    ...query,
    data: query.data && { items: query.data.departments as Department[], totalCount: query.data.totalCount },
  }
}

const usePositionList = (params: PagedParams) => {
  const query = usePositionsPaged(params)
  return {
    ...query,
    data: query.data && { items: query.data.positions as Position[], totalCount: query.data.totalCount },
  }
}

export function OrgUnitsView() {
  const createDepartment = useCreateDepartment()
  const updateDepartment = useUpdateDepartment()
  const deleteDepartment = useDeleteDepartment()
  const createPosition = useCreatePosition()
  const updatePosition = useUpdatePosition()
  const deletePosition = useDeletePosition()

  return (
    <div className='grid items-start gap-4 xl:grid-cols-2'>
      <OrgUnitPanel
        title='Phòng ban'
        label='phòng ban'
        useList={useDepartmentList}
        create={createDepartment}
        update={updateDepartment}
        remove={deleteDepartment}
      />
      <OrgUnitPanel
        title='Chức vụ'
        label='chức vụ'
        useList={usePositionList}
        create={createPosition}
        update={updatePosition}
        remove={deletePosition}
      />
    </div>
  )
}
