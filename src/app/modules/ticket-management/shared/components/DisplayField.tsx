import React, {useEffect, useState} from 'react'
import {TicketFieldSizes} from '../../constants/useConstant'
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel'
import {useTicketManagementHooks} from '../hooks/useTicketManagementHooks'

const DisplayField = ({ field, dynamicTicketForm, defaultSize }: any) => {
  const [displayValue, setDisplayValue] = useState<string>("")
  const [requiredField, setRequiredField] = useState<boolean>(false);
  const {formatFieldSelector } = useTicketManagementHooks();
  
  useEffect(() => {
    if (!dynamicTicketForm || dynamicTicketForm.length === 0) return
    setRequiredField(field.isRequired) 
    let findDynamicRecord = dynamicTicketForm.find((record: DynamicTicketModel) => record.fieldMappingId === field.fieldMappingId)
    setRequiredField(findDynamicRecord.fieldRequired) 
    if (!findDynamicRecord) return
    if (findDynamicRecord.fieldValue === '') {
      setDisplayValue('')
    }
    if (!findDynamicRecord.fieldValue) return
    setDisplayValue(findDynamicRecord.fieldValue)
    return () => { }
  }, [dynamicTicketForm])

  return (
    <div id={formatFieldSelector(field.fieldMappingId,field.fieldName)} aria-label={`${field.fieldMappingId}-${field.fieldName}`} className={TicketFieldSizes[(defaultSize) ? "Default" : field.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className={`col-form-label col-sm ${requiredField && 'required'}`} >{field.fieldName} : {displayValue}</div>      
    </div>
  )
}

export default DisplayField