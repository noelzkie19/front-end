import { BrandRowsModel, CurrencyRowsModel, TopicRowsModel } from "..";
export interface SubtopicResponseModel {
    id: number,
    subTopicName: string,
    isActive: string,
    position: number,
    topicId: number,
    brand: Array<BrandRowsModel>,
    currency: Array<CurrencyRowsModel>,
    topic: Array<TopicRowsModel>,
    createdBy?: number,
    createdDate?: string,
    updatedBy?: number,
    updatedDate?: string,
}
