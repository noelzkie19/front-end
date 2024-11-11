import swal from "sweetalert";
import {LookupModel} from "../../../shared-models/LookupModel";
import useTicketConstant from "../constants/TicketConstant";
import {TicketDetailModel} from "../models/TicketDetailModel";
import {TicketInfoModel} from "../models/TicketInfoModel";
import {TicketPlayerModel} from "../models/TicketPlayerModel";
import {TransactionDataModel} from "../models/TransactionDataModel";
import {TransactionFieldMappingResponseModel} from "../models/response/TransactionFieldMappingResponseModel";
import {TransactionStatusReferenceResponseModel} from "../models/response/TransactionStatusReferenceResponseModel";
import {DynamicTicketModel} from "../models/ticket-config/DynamicTicketModel";
import {FieldMappingResponseModel} from "../models/ticket-config/FieldMappingResponseModel";
import {TextInputSearchValidationModel} from "../models/ticket-config/TextInputSearchValidationModel";
import {TicketTypeResponseModel} from "../models/ticket-config/TicketTypeResponseModel";
import { TICKET_DEFAULT } from "../constants/TicketDefault";

export const countDecimalCharacters = (value: string, constraint: any) => {
  if (!constraint) return false
  // Find the position of the decimal point
  const decimalPointIndex = value.indexOf('.');

  if (decimalPointIndex === -1) {
    return false;
  }

  // Calculate the number of characters after the decimal point
  const charactersAfterDecimal = value.length - decimalPointIndex - 1;

  return charactersAfterDecimal > constraint['DecimalPlace'];
}

// update dynamic ticket via text box with search
export const updateTicketForm = (
  transactionFieldMapping: Array<TransactionFieldMappingResponseModel>,
  dynamicTicketForm: any,
  transactionData: TransactionDataModel,
  ) => {
 const updateDynamicTicketForm = dynamicTicketForm.reduce((acc: any, curr: any) => {
 const { TICKET_FIELD } = useTicketConstant()
 let mapTicketForm = transactionFieldMapping.find((record) => record.fieldId === curr.fieldId)    
 if (mapTicketForm) {
     const newTransactionValue = convertToString(transactionData, mapTicketForm)
     const mappedMlabValue = newTransactionValue.mappedMlabValue;
     const mappedIcoreValue = newTransactionValue.mappedIcoreValue;
     const mappedFmboValue = newTransactionValue.mappedFmboValue;
     const fieldData = getFieldValues(mappedMlabValue, mappedIcoreValue ,mappedFmboValue, curr.fieldId , TICKET_FIELD)
     const newFieldValue = typeof fieldData.fieldValue !== 'string' && fieldData.fieldValue ? String(fieldData.fieldValue) : fieldData.fieldValue;
     
     let updatedField = { 
         ...curr, 
         fieldValue: newFieldValue,
         fieldActive: !newFieldValue,
         fieldRequired: curr.fieldRequired ? !newFieldValue : curr.fieldRequired,
         externalFieldValue: fieldData.externalFieldValue
     };
     acc.push(updatedField)
 } else {
     acc.push(curr)
 }
 return acc
 }, [])

 return updateDynamicTicketForm
}

export const getFieldValues = (mappedMlabValue: any , mappedIcoreValue: any , mappedFmboValue: any, fieldId: any, ticketField: any)=>{
  let fieldValue, fieldActive , externalFieldValue;
    if (mappedMlabValue) {
        fieldValue  =  mappedMlabValue;
        fieldActive = !fieldValue;
    }

    if(mappedIcoreValue || mappedFmboValue) {
        fieldValue = mappedIcoreValue ?? mappedFmboValue;
        fieldActive = !fieldValue;
    }

    const transactionIdValue = getTransactionIdValue(fieldId, ticketField, mappedMlabValue, mappedIcoreValue, mappedFmboValue)
    if(transactionIdValue.fieldValue){
      fieldValue = transactionIdValue.fieldValue
      fieldActive = transactionIdValue.fieldActive
    }

    return {
      fieldValue,
      fieldActive,
      externalFieldValue
    }
}

export const getTransactionIdValue = (fieldId: any, ticketField: any, mappedMlabValue: any , mappedIcoreValue: any , mappedFmboValue: any) => {
  let fieldValue, fieldActive ;
  if(fieldId === ticketField.PlatformTransactionId && (mappedMlabValue || mappedFmboValue)){
    const newTransactionIdValue = (mappedIcoreValue === mappedFmboValue) ? mappedIcoreValue : ''
    fieldValue = mappedMlabValue ?? newTransactionIdValue;
    fieldActive = !fieldValue;
  }

  if(fieldId === ticketField.PaymentSystemTransactionId && (mappedMlabValue || mappedIcoreValue)){
    const newPaymentSystemIdValue = (mappedIcoreValue === mappedFmboValue) ? mappedFmboValue : ''
    fieldValue = mappedMlabValue ?? newPaymentSystemIdValue;
    fieldActive = !fieldValue;
  }

  return {
    fieldValue,
    fieldActive
  }
}

export const convertToStringIfNumber = (value: any) => {
  return typeof value === 'number' ? value.toString() : value;
}

export const convertToString = (transactionData: any, mapTicketForm: any) =>{
  let mappedMlabValue = convertToStringIfNumber(transactionData.mlabTransactionData?.[mapTicketForm?.apiFieldMlabEquivalent as keyof typeof transactionData.mlabTransactionData])
  let mappedIcoreValue = convertToStringIfNumber(transactionData.iCoreTransactionData?.[mapTicketForm?.apiFieldIcoreEquivalent as keyof typeof transactionData.iCoreTransactionData])
  let mappedFmboValue = convertToStringIfNumber(transactionData.fmboTransactionData?.[mapTicketForm?.apiFieldFmboEquivalent as keyof typeof transactionData.fmboTransactionData])


  return {
    mappedMlabValue,
    mappedIcoreValue,
    mappedFmboValue
  }
}

export const returnStatusValue = (transactionStatusReference: any, mappedMlabValue: any , mappedIcoreValue: any, mappedFmboValue: any , transactionTag: any , fieldId: any) => {
  const newIcoreStatusValue =  transactionStatusReference?.find((e: TransactionStatusReferenceResponseModel) => e.apiStatusId === (mappedIcoreValue || mappedMlabValue)
     && e.fieldId === fieldId
     && e.transactionTag === transactionTag.ICORE
     )?.staticReferenceId.toString()

     const newFmboStatusValue =  transactionStatusReference?.find((e: TransactionStatusReferenceResponseModel) => e.apiStatusId === (mappedFmboValue || mappedMlabValue)
     && e.fieldId === fieldId
     && e.transactionTag === transactionTag.FMBO
     )?.staticReferenceId.toString()

     const newIcoreStatusName =  transactionStatusReference?.find((e: TransactionStatusReferenceResponseModel) => e.apiStatusId === (mappedIcoreValue || mappedMlabValue)
     && e.fieldId === fieldId
     && e.transactionTag === transactionTag.ICORE
     )?.staticReferenceDescription.toString()

     const newFmboStatusName =  transactionStatusReference?.find((e: TransactionStatusReferenceResponseModel) => e.apiStatusId === (mappedFmboValue || mappedMlabValue)
     && e.fieldId === fieldId
     && e.transactionTag === transactionTag.FMBO
     )?.staticReferenceDescription.toString()

     const newStatusValues = { 
      newIcoreStatusValue,
      newFmboStatusValue,
      newIcoreStatusName,
      newFmboStatusName
    };

     return newStatusValues

}

// update dynamic ticket field value via querying by ticketId
export const UpdateTicketFieldValue = (transactionData: any, dynamicTicketForm: any) => {
  if (!transactionData) return dynamicTicketForm
  if (transactionData.length === 0) return
  const updateDynamicTicketForm = dynamicTicketForm.reduce((acc: any, curr: any) => {
    let ticketFieldValue = transactionData.find((record: TicketDetailModel) => record.ticketTypeFieldMappingId === curr.fieldMappingId)   
    if (ticketFieldValue ) {      
      let mappedValue = ticketFieldValue.ticketTypeFieldMappingValue 
      let updatedField = !ticketFieldValue.isTransactionFieldMapping  ? { ...curr, fieldValue: mappedValue, fieldActive: !mappedValue} : { ...curr, fieldValue: mappedValue, fieldActive: false, fieldRequired: false}          
      acc.push(updatedField)
    } else {
      acc.push(curr)
    }    
    return acc
  }, [])
  return updateDynamicTicketForm
}

export const moldingDynamicTicketForm = (dynamicActiveFields: FieldMappingResponseModel[]): DynamicTicketModel[] => {
  return dynamicActiveFields.reduce((acc: any, curr: FieldMappingResponseModel) => {
    acc.push({
      fieldId: curr.fieldId,
      fieldMappingId: curr.fieldMappingId,
      fieldName: curr.fieldName,
      fieldValue: null,
      fieldRequired: curr.isRequired,
      fieldActive: true
    })
    return acc
  }, [])
}

export const updatingDynamicTicketForm = (dynamicTicketForm: DynamicTicketModel[] | undefined, fieldId: number | string, fieldValue: string) => {
  const updateDynamicForm = dynamicTicketForm?.find((field: any) => field.fieldId === fieldId)
  const updatedData = { ...updateDynamicForm, fieldValue: fieldValue, fieldActive: true }
  const filteredData: any = dynamicTicketForm?.filter((field: any) => field.fieldId !== fieldId)
  const updatedForm = [...filteredData, updatedData]
  return updatedForm
}

export const getLookUpByValueOrLabel = (drpDownLookUps: LookupModel[], selectedDynamicRecord: DynamicTicketModel) => {
  if (drpDownLookUps.length === 0) return
  const fieldValue = selectedDynamicRecord ? selectedDynamicRecord.fieldValue : ''
  const caseValue  = fieldValue ? fieldValue.toLowerCase() : fieldValue
  const queryByValue = drpDownLookUps.find((selection: LookupModel) => selection.value.toString() === fieldValue);
  const queryByLabel = drpDownLookUps.find((selection: LookupModel) => selection.label.toLowerCase() === caseValue);
  return queryByValue ?? queryByLabel;
}


export const getMappingBySection = (mapping: FieldMappingResponseModel[], sectionId: number) => {
  const mappingBySection = mapping.filter((fields: any) => fields.ticketSectionId === sectionId)
  return mappingBySection
}

// Split ticket code and return ticket ID and ticket type ID
export const splitTicketCode = (ticketCode: string, ticketConfig: TicketTypeResponseModel[]) => {
  const splitCodeByChar = ticketCode.split('-')
  const ticketIdFromTicketConfig = ticketConfig?.find((ticket: TicketTypeResponseModel) => ticket.ticketCode.toLowerCase().trim() === splitCodeByChar[0].toLowerCase().trim())

  const result = {
    ticketTypeSequenceId: parseInt(splitCodeByChar[1]),
    ticketTypeId: parseInt((ticketIdFromTicketConfig?.ticketId ?? '').toString())
  }

  return result
}

// To Trigger only on edit ticket 
// Sets Re Enables fields to active when specific field constraint is met 
export const reactivateTicketField = (ticketFieldMapping: FieldMappingResponseModel[], dynamicTicketForm: DynamicTicketModel[]) => {
  if (!ticketFieldMapping) return
  if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
  const updatedDynamicTicketForm = dynamicTicketForm.reduce((acc: DynamicTicketModel[], curr: DynamicTicketModel) => {
    const getFieldConstraintByMappingId = ticketFieldMapping.find((field: FieldMappingResponseModel) => field.fieldMappingId === curr.fieldMappingId)
    if (getFieldConstraintByMappingId?.fieldConstraint) {
      const getConstraints = JSON.parse(getFieldConstraintByMappingId.fieldConstraint)
      const hasActiveOnEdit = getConstraints.hasOwnProperty("ActiveOnEdit") // confirm if specific property exists
      if (hasActiveOnEdit) {
        acc.push({ ...curr, fieldActive: getConstraints["ActiveOnEdit"] })
      } else {
        acc.push(curr) // Do nothing and proceed normally as fallback or if field constraint is null
      }
    } else {
      acc.push(curr) // Do nothing and proceed normally as fallback or if field constraint is null
    }

    return acc
  }, [])

  return updatedDynamicTicketForm
}

export const validateFormTicketFields = async (dynamicTicketForm: DynamicTicketModel[]) => {
  console.log(dynamicTicketForm)
  let isValid: boolean = false;
  const requiredFieldUnfilled = dynamicTicketForm?.filter((obj: any) => obj.fieldRequired === true && obj.isSupersedeOptional === undefined  && (obj.fieldValue === null || obj.fieldValue === undefined || obj.fieldValue === null || (typeof obj.fieldValue === 'string' && obj.fieldValue.trim() === '')));

  isValid = requiredFieldUnfilled && requiredFieldUnfilled.length == 0

  return isValid
};

// player Id : 0 is considered as unvalidated player 
// find from array if there is a playerId with value of 0
export const checkForUnvalidatedPlayers = async (queriedPlayers: TicketPlayerModel[]) => {
  if (!queriedPlayers) return true
  const hasUnvalidatedPlayers = queriedPlayers.some((player: TicketPlayerModel) => player.playerId === '' || player.mlabPlayerId === 0)
  return hasUnvalidatedPlayers
}

// Isolating process code for building ticket header code on View and Edit ex Missing Deposit | MDP
export const ticketHeaderCode = (ticketConfig: TicketTypeResponseModel[], ticketTypeId: number | string, ticketCode?: any) => {
  const findTicketConfig = ticketConfig.find((ticket: any) => ticket.ticketId === Number(ticketTypeId));
  return ticketCode === null ? `${findTicketConfig?.ticketName} | ${findTicketConfig?.ticketCode}` : `${findTicketConfig?.ticketName} | ${ticketCode}`
}

export const sharedTicketConfigurations = (
  ticketInfo: TicketInfoModel,
  setTicketInfo: any,
  ticketId: number,
  setSelectedTicketSequenceId: any,
  ticketTypeId: number,
  setSelectedTicketTypeId: any
) => {
  setSelectedTicketSequenceId(ticketId)
  setSelectedTicketTypeId(ticketTypeId)
  setTicketInfo({ ...ticketInfo, ticketId: ticketId, ticketTypeId: ticketTypeId })
}


export const pushTo401 = (history: any) => {
  history.push('/error/401');
}

export const textInputSearchValidationArr = (fieldMapping: FieldMappingResponseModel[]): TextInputSearchValidationModel[] => {
  const getTextInputSearch = fieldMapping.filter((field: FieldMappingResponseModel) => field.fieldType.toLowerCase() === 'Text Input with Search Action'.toLowerCase())
  const moldedTextInputSearchValidation = getTextInputSearch.reduce((acc: TextInputSearchValidationModel[], curr: FieldMappingResponseModel) => {
    acc.push({fieldId:curr.fieldId, fieldMappingId: curr.fieldMappingId, fieldName: curr.fieldName, fieldValidated: false })
    return acc
  }, [])

  return moldedTextInputSearchValidation
}


export const CheckForUnvalidatedTextInputSearch = async (textInputSearchfields: TextInputSearchValidationModel[], hiddenTicketFields?: any) => {
  //Remove Provider Transaction ID auto validate when searching for that field is implemented
  const hasUnvalidatedTextInput = textInputSearchfields
  ?.find((field: TextInputSearchValidationModel) =>
    !hiddenTicketFields?.some((hiddenField: any) => hiddenField.fieldId === field.fieldId) &&
    field.fieldValidated === false 
  );
  if (hasUnvalidatedTextInput) {
    swal('Failed', `Unable to proceed, ${hasUnvalidatedTextInput.fieldName} must be validated`, 'error')
  }
  return hasUnvalidatedTextInput
}

// This logic is intended to update the model that would be used on text input search validation through api call
export const updateTextInputSearchValidationList = (transactionData: any[], textInputSearchList: TextInputSearchValidationModel[]): TextInputSearchValidationModel[] => {
  if (!transactionData) return []
  if (textInputSearchList.length === 0) return []
  const updatedTextInputSearchList: TextInputSearchValidationModel[] = textInputSearchList.reduce((acc: TextInputSearchValidationModel[], curr: TextInputSearchValidationModel) => {
    let findByMappinId = transactionData.find((information: DynamicTicketModel) => information.fieldMappingId === curr.fieldMappingId)
    if (findByMappinId) {
      acc.push({ fieldId: curr.fieldId, fieldMappingId: curr.fieldMappingId, fieldName: curr.fieldName, fieldValidated: !!findByMappinId.fieldValue })
    } else {
      acc.push(curr)
    }
    return acc
  }, [])
  return updatedTextInputSearchList
}

// This logic would unverify text input search values because of factors mainly user input
export const updateUnverifyTextInputSearchValidationList = (textInputValidationArr: TextInputSearchValidationModel[] , fieldMappingId: number) => {
  if (!textInputValidationArr) return
  const findTransactionToUnverify = textInputValidationArr.find((record: any) => record.fieldMappingId === fieldMappingId)
  if (!findTransactionToUnverify) return
  const filterTransactionToUnverify = textInputValidationArr.filter((record: any) => record.fieldMappingId !== fieldMappingId)
  return [...filterTransactionToUnverify, {fieldId: findTransactionToUnverify.fieldId, fieldMappingId: findTransactionToUnverify.fieldMappingId, fieldName: findTransactionToUnverify.fieldName, fieldValidated: false}]
}

export const validateStringValue = (value: any) => {
  return value ?? "";
}

// returns 2 dimensional array to serve as layout for a group configured to have two columns instead of using field size
export const GroupingLayoutMultipleColumns = (fieldsPerSection: any, columnCount: number, superSedeFields: [], ticketId: number) => {
  if (!fieldsPerSection) return
  const fieldsWithSuperSede = ticketId !== 0 ? fieldsPerSection :  fieldsPerSection.filter((field1: any) =>
    !superSedeFields.some((field2: any) => field1.fieldId === field2.fieldId)
  );
  const chunkSize = Math.ceil(fieldsWithSuperSede.length / columnCount);

  let result = fieldsWithSuperSede.reduce((acc:any, _: any, idx: number) => {
      if (idx % chunkSize === 0) {
          const chunk = fieldsWithSuperSede.slice(idx, idx + chunkSize);
          acc.push(chunk);
      }
      return acc;
  }, []);

  
  if (ticketId === TICKET_DEFAULT.ticketId) { 
    const forClearing : any = document.getElementsByClassName('hidden-field') ?? []
    Array.from(forClearing).forEach((element: any) => {
    element.classList.remove('hidden-field');
  });
}

  return result
}

export const IsNotPlatformOrPaymentStatus = (field: any): boolean  => {
  const { TICKET_FIELD } = useTicketConstant()
  const fieldId = field.fieldId ?? field.ticketFieldId
  return fieldId !== TICKET_FIELD.PlatformStatusId && fieldId !== TICKET_FIELD.PaymentSystemTransactionStatusId;
}

export const arraysEqual = (arr1: any, arr2: any) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

export const formatCurrencyValue = (value: any, minDecimal: number = 0) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: minDecimal, // Minimum number of decimal places
    maximumFractionDigits: minDecimal === 0 ? 0 : 2  // Maximum number of decimal places
  });
  return formatter.format(value);
}
