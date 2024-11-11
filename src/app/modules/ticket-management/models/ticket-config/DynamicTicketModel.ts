
export interface DynamicTicketModel {
  fieldId: string | number
  fieldMappingId: number
  fieldName: string
  fieldValue: string
  fieldRequired?: boolean
  fieldActive?: boolean
  isSupersedeHidden?: boolean;
  isSupersedeOptional?: boolean;
  mode?: string;
  externalFieldValue?: string
}
