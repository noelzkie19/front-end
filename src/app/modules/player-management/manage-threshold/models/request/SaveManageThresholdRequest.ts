import { ManageThresholdRequest } from "./ManageThresholdRequest";
export interface SaveManageThresholdRequest {
    queueId: string,
    userId: string,
    manageThresholds: Array<ManageThresholdRequest>
}