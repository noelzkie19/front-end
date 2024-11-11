import { BrandModel } from "./BrandModel";

export interface ConfigurationBaseModel {
    id: number,
    name: string,
    code?: string,
    brand: Array<BrandModel>
}