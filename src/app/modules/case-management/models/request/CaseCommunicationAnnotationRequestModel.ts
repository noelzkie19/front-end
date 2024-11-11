import {BaseModel} from "../../../user-management/models/BaseModel";
import {CaseCommunicationAnnotationModel} from "../response/CaseCommunicationAnnotationModel";

export interface CaseCommunicationAnnotationRequestModel extends BaseModel{
    CaseCommunicationAnnotationUdt: Array<CaseCommunicationAnnotationModel>,
    CaseCommunicationId: number,

}