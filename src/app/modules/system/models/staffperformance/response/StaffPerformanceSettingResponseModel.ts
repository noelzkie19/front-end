export interface StaffPerformaneSettingResponseModel
{
    staffPerformanceSettingList: Array<StaffPerformanceSettingDetails>,
    rowCount: number
}

export interface StaffPerformanceSettingDetails
{
    staffPerformanceSettingId: number,
    settingName: string,
    parent: string
}

export const STAFF_PERFORMANCE_SETTING_LIST_DEFAULT: StaffPerformaneSettingResponseModel = {
    staffPerformanceSettingList: [],
    rowCount: 0
}