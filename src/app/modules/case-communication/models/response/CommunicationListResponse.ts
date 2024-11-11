import { CommunicationResponse } from "..";

export interface CommunicationListResponse {
    totalRecordCount : number,
    communicationList : Array<CommunicationResponse>
}