import { RequestModel } from './RequestModel';
export interface PlayerConfigItemModel extends RequestModel {
    id: number,
    name: string,
    code: string,
    brands: string
}
