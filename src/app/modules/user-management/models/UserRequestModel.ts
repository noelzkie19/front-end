import { TeamSelectedModel } from "./TeamSelectedModel";
import { CommunicationProvidersUdtRequestModel } from "./udt/CommunicationProvidersUdtRequestModel";

export interface UserRequestModel {
    userIdRequest: number
    createdBy: number,
    email: string,
    fullName: string,
    status: number,
    teams: Array<TeamSelectedModel>,
    updatedBy: number,
    queueId: string,
    userId: string,
    userPassword: string,
    ticketTeamAssignmentId: Array<TeamSelectedModel>,
    ticketCurrencyAssignmentId: Array<TeamSelectedModel>,
    mcoreUserId: string,
    communicationProviders : Array<CommunicationProvidersUdtRequestModel>
}
