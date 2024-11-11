
export interface CaseCommunicationAnnotationModel {
    caseCommunicationAnnotationId?: number
    caseCommunicationId: number
    start: number
    end: number
    text: string
    tag: string
    isValid?:boolean
    positionGroup: string
}