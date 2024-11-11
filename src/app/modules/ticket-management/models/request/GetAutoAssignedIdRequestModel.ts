export interface GetAutoAssignedIdRequestModel {
    statusId: number,
    ticketTypeId: number,
    paymentMethodId: number,
    mlabPlayerId: number,
    ticketId: number,
    ticketCode: string,
    statusDescription: string,
    departmentId: number
    adjustmentAmount: number
}
