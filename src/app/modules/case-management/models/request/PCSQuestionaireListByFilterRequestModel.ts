import { BaseModel } from "../../../user-management/models/BaseModel"
import { PCSCommunicationQuestionsWithAnswersUdtModel } from "../udt/PCSCommunicationQuestionsWithAnswersUdtModel"

export interface PCSQuestionaireListByFilterRequestModel extends BaseModel {
    brandId :string
    messageTypeId?: string
    license?: string
    skillId? : string
    communicationProvider?: string
    summaryAction?: string
    startDate?: string
    endDate? : string
    pcsCommunicationQuestionAnswerType?: Array<PCSCommunicationQuestionsWithAnswersUdtModel>
}