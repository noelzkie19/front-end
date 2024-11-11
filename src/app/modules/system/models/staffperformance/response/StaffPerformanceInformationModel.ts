export interface StaffPerformanceInformationModel {
  settingName: string
  parent: string
  createdDate: string
  createdBy: string
  lastModifiedDate: string
  lastModifiedBy: string
}

export const STAFF_PERFORMANCE_INFO_DEFAULT : StaffPerformanceInformationModel = {
  settingName: '',
  parent: '',
  createdDate: Date().toString(),
  createdBy: 'Admin',
  lastModifiedDate: Date().toString(),
  lastModifiedBy: 'Admin'
}