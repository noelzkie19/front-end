import { RequestModel } from './../RequestModel';
export interface PlayerConfigFilterModel extends RequestModel {
    id: string,
    name: string,
    code: string
}