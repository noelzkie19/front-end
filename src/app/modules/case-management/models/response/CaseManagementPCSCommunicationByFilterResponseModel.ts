import { CaseManagementPCSCommunicationResponseModel } from "./CaseManagementPCSCommunicationResponseModel"

export interface CaseManagementPCSCommunicationByFilterResponseModel {
    recordCount : number
    caseManagementPCSCommunications: Array<CaseManagementPCSCommunicationResponseModel>
}