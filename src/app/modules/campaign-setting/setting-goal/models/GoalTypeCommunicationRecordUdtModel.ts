export interface GoalTypeCommunicationRecordUdtModel{
    goalTypeCommunicationRecordId: number
    sequenceId: number
    sequenceName: string
    goalTypeId: number
    goalTypeName: string
    campaignSettingId: number
    messageTypeId: number
    messageStatusId: number
    goalTypeDataSourceId: number
    goalTypePeriodId: number
    createdBy: number
    //createdDate: string
    updatedBy: number
    //updatedDate: string
    communicationGuid?: string
}