import { PCSCommunicationQuestionAnswerUdtModel, PCSCommunicationQuestionsWithAnswersUdtModel, PCSQuestionaireListByFilterRequestModel } from ".."

export interface CaseManagementPCSCommunicationByFilterRequestModel extends PCSQuestionaireListByFilterRequestModel {
    pageSize : number
    offsetValue :  number
    sortColumn : string
    sortOrder : string
    pcsCommunicationQuestionAnswerType: Array<PCSCommunicationQuestionsWithAnswersUdtModel>
}