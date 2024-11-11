export interface GetAllProcessorResponseModel {
    paymentProcessorId: number
    paymentProcessorName: string
    departmentId: number
    verifier: number
    isForSmVerification: boolean
    externalSourceId: number
}