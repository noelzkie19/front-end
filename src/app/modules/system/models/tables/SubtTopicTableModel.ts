import { BrandRowsModel, CurrencyRowsModel, TopicRowsModel } from "..";

export interface SubtTopicTableModel {
    id: number
    subTopicName: string
    topic: Array<TopicRowsModel>
    brand: Array<BrandRowsModel>
    currency: Array<CurrencyRowsModel>
    position: number
    subTopicStatus?: string
    createdBy?: number
    createdDate?: string
    updatedBy?: number
    updatedDate?: string
}
