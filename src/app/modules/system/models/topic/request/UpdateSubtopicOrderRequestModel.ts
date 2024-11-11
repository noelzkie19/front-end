import { BaseRequest } from "../../../../../shared-models/BaseRequest";
import { SubtopicOrderTypeUdtModel } from "../udt/SubtopicOrderTypeUdtModel";

export interface UpdateSubtopicOrderRequestModel extends BaseRequest {
    subtopicOrderType : Array<SubtopicOrderTypeUdtModel>
}