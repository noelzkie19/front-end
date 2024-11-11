export interface FieldMappingResponseModel {
  fieldId: number;
  fieldName: string;
  fieldType: string;
  fieldMappingId: number;
  fieldConstraint: string;
  fieldSizeName: string;
  ticketSectionId: number;
  ticketGroupName: string;
  hasAdd: boolean;
  hasEdit: boolean;
  hasView: boolean;
  isRequired: boolean;
  isSupersedeHidden?: boolean;
  isSupersedeOptional?: boolean;
  mode?: string;
}