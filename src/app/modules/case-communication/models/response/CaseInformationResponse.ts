export interface CaseInformationResponse {
    caseInformatIonId: number
    playerId: string,
    caseCreatorId: number
    caseCreatorName: string
    campaignId: number
    campaignName: string
    caseStatusId: number
    caseStatusName: string
    caseTypeId: number
    caseTypeName: string
    topicId: number
    topicName: string
    subtopicId: number
    subtopicName: string
    createdBy?: number
    createdByName?: string
    createdDate?: string
    updatedBy?: number
    updatedByName: string
    updatedDate?: string
    mlabPlayerId: number
    brandName: string
}

