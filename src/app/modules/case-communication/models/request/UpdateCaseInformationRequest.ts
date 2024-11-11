export interface UpdateCaseInformationRequest {
    queueId: string
    userId: string
    caseInformationId: number
    caseCreatorId: number
	campaignId: number		
	caseStatusId: number		
	caseTypeId: number		
	topicId: number		
	subtopicId: number		
    mlabPlayerId: number	
}