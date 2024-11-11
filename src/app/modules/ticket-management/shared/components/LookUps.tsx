import { useState, useEffect } from 'react'
import { LookupModel } from '../../../../shared-models/LookupModel'
import { DynamicTicketModel } from '../../models/ticket-config/DynamicTicketModel'
import { TicketFieldSizes } from '../../constants/useConstant'
import { SelectFilter } from '../../../relationship-management/shared/components'
import { getLookUpByValueOrLabel } from '../../utils/helper'
import { useTicketConfigurationHooks } from '../hooks/useTicketConfigurationHooks'

const LookUps = ({ field, dynamicTicketForm, updateDynamicTicket, viewOnly, fromModal, defaultSize,
  isMulti }: any) => {
  const [selectedLookUp, setSelectedLookUp] = useState<LookupModel>() // this would be the selected via drop down click0
  const [isDisable, setIsDisable] = useState<boolean>(false)
  const { getTicketManagementLookUpsByFieldId, ticketMgmntLookUps } = useTicketConfigurationHooks();
  const [requiredField, setRequiredField] = useState<boolean>(false);
  
  useEffect(() => {
    if (!viewOnly) return
    if(!fromModal) {
      setIsDisable(true);
    }
    return () => { }
  }, [viewOnly])

  useEffect(() => {
    getTicketManagementLookUpsByFieldId(field.fieldId)
    return () => { }
  }, [])

  useEffect(() => {
    handleDefaultPriority()
  
    return () => {
      
    }
  }, [field])
  

  useEffect(() => {    
    setRequiredField(field.isRequired) 
    const findDynamicRecord = dynamicTicketForm?.find((fieldData: DynamicTicketModel) => fieldData.fieldMappingId === field.fieldMappingId)
    if (!findDynamicRecord) return
    setRequiredField(findDynamicRecord.fieldRequired) 
    
    const findFromLookUps = getLookUpByValueOrLabel(ticketMgmntLookUps, findDynamicRecord)
    if (findFromLookUps?.value === findDynamicRecord) return
    if (!findFromLookUps) return
    if(!isMulti)//The multi select dropdown is not yet supported by the dynamic form. 
    //Refactor and remove this line if multi values selected already implemented
    setSelectedLookUp(findFromLookUps)
    
    if(!fromModal){
      if (!findDynamicRecord.fieldActive) {
        setIsDisable(true)
      } else {
        setIsDisable(viewOnly ?? !findDynamicRecord.fieldActive)
      }
    }
  
    if (findDynamicRecord.fieldValue === '') {
      setSelectedLookUp(undefined)
    }
    if (findFromLookUps.label === findDynamicRecord.fieldValue) { // To update field value into selecting value properties if ever the existing field value is the same as label properties
      updateDynamicTicket(field.fieldId, findFromLookUps.value.toString(), findFromLookUps.label.toString())
    }
    
    handleDefaultPriority()
    if (findDynamicRecord.fieldValue !== null || findDynamicRecord.fieldValue !== '') return // guard clause to prevent useEffect from exceeding limit
    updateDynamicTicket(field.fieldId, findFromLookUps.value.toString(), findFromLookUps.label.toString())
    return () => { }
  }, [dynamicTicketForm, ticketMgmntLookUps])

  const handleChangeLookup = (selectedLookUp: any) => {
    setSelectedLookUp(selectedLookUp)
    if(isMulti){
      selectedLookUp.map((item: any) => {
      updateDynamicTicket(field.fieldId, item.value.toString(), item.label.toString())
      });
    }
    else
    updateDynamicTicket(field.fieldId, selectedLookUp.value.toString(), selectedLookUp.label.toString())
  }

  const handleDefaultPriority = () => {
    if (field.fieldName.toLowerCase() === 'priority') { // only for priority look up
      const findDynamicRecord = dynamicTicketForm?.find((fieldData: DynamicTicketModel) => fieldData.fieldMappingId === field.fieldMappingId)
      setIsDisable(viewOnly ?? false)
      if(!ticketMgmntLookUps || ticketMgmntLookUps.length === 0) return
      if (findDynamicRecord.fieldValue === null || findDynamicRecord.fieldValue === '') {
        setSelectedLookUp({ value: ticketMgmntLookUps[0].value.toString(), label: ticketMgmntLookUps[0].label.toString()})
        updateDynamicTicket(field.fieldId, ticketMgmntLookUps[0].value.toString())        
      }
    }
  }

  return (
    <div aria-label={`${field.fieldMappingId}-${field.fieldName}`} className={TicketFieldSizes[(fromModal || defaultSize) ? "Default" : field.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className={`col-form-label col-sm ${requiredField ? 'required' : ' '}`}   >{field.fieldName}</div>
      <SelectFilter
        isMulti={isMulti}
        options={ticketMgmntLookUps}
        label=""
        onChange={handleChangeLookup}
        value={selectedLookUp}
        isDisabled={isDisable}
      />
    </div>
  )
}

export default LookUps