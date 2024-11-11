export interface FlyFoneCallHistoryUdtModel {
    flyFoneCallHistoryId : number
    recordId : number
    userId: number
    outNumber: string
    extension: string
    department: string
    startTime: string
    endTime: string
    callingCode: string
    responsePayload: string
}