import {useEffect, useState} from 'react'
import {LookupModel} from '../../../../shared-models/LookupModel'
import {SelectFilter} from '../../../relationship-management/shared/components'
import {TicketFieldSizes} from '../../constants/useConstant'
import {DynamicTicketModel} from '../../models/ticket-config/DynamicTicketModel'
import {getLookUpByValueOrLabel} from '../../utils/helper'
import {useTicketConfigurationHooks} from '../hooks/useTicketConfigurationHooks'


const DropdownSingleSelectionToTextDisplay = ({ field, dynamicTicketForm, updateDynamicTicket, viewOnly, currentTicketId , fromModal, defaultSize }: any) => {
  const [selectedLookUp, setSelectedLookUp] = useState<LookupModel>() // this would be the selected via drop down click
  const [showDropDown, setShowDropDown] = useState<boolean>(true)
  const [lookUpText, setLookUpText] = useState<string>()
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const { getTicketManagementLookUpsByFieldId, ticketMgmntLookUps } = useTicketConfigurationHooks();
  const [requiredField, setRequiredField] = useState<boolean>(false);

  useEffect(() => {
    if (!viewOnly) return

    if(!fromModal){
      setIsDisabled(true)
      setShowDropDown(false)
    }
    return () => { }
  }, [viewOnly])

  useEffect(() => {
    getTicketManagementLookUpsByFieldId(field.fieldId)
    return () => { }
  }, [])


  useEffect(() => {
    if (field.fieldConstraint === null) return
    const getConstraints = JSON.parse(field.fieldConstraint)
  
    if (currentTicketId !== 0 && !viewOnly) {
      handleEditState(getConstraints);
      handleModalState(getConstraints);
    } else if (currentTicketId === 0) {
      handleAddState(getConstraints);
    }

    handleSupersedeOptional()
    return () => { }
  }, [field])

  const handleAddState = (getConstraints: any) => {
    const activeOnAdd = getConstraints.hasOwnProperty("ActiveOnAdd")
    const activeAdd = getConstraints['ActiveOnAdd']
    if (activeOnAdd !== undefined) {
      setIsDisabled(!activeAdd);
      setShowDropDown(activeAdd);
    }
  };
  
  const handleEditState = (getConstraints: any) => {
    const activeOnEdit = getConstraints.hasOwnProperty("ActiveOnEdit")
    const activeEdit = getConstraints['ActiveOnEdit']
    if (activeOnEdit !== undefined) {
      setIsDisabled(!activeEdit);
      setShowDropDown(activeEdit);
    }
  };

  const handleModalState = (getConstraints: any) => {
    const activeOnModal =  getConstraints.hasOwnProperty("ActiveOnModal")
    if (activeOnModal !== undefined && fromModal) {
      setIsDisabled(false);
      setShowDropDown(true);
    }
  };

  const handleSupersedeOptional = () => {
    if (field.isSupersedeOptional !== undefined) {
      setRequiredField(false);
    }
  };

  useEffect(() => {
    const isDropdownFieldRequired = field.isSupersedeOptional !== undefined ? false : field.isRequired
    setRequiredField(isDropdownFieldRequired) 
    const findDynamicRecord = dynamicTicketForm?.find((fieldData: DynamicTicketModel) => fieldData.fieldMappingId === field.fieldMappingId)
    if (!findDynamicRecord) return
    const isDynamicDropdownRequired = findDynamicRecord.isSupersedeOptional !== undefined ? false : (findDynamicRecord.fieldRequired ?? field.fieldRequired)
    setRequiredField(isDynamicDropdownRequired) 
    const findFromDropDown = getLookUpByValueOrLabel(ticketMgmntLookUps, findDynamicRecord)
    if (findFromDropDown?.value === findDynamicRecord) return

    if (!findFromDropDown) return
    setSelectedLookUp(findFromDropDown)
    setLookUpText(findFromDropDown.label)
    if(!fromModal){
      if (viewOnly) {
        setIsDisabled(true)
        return
      } 
      if (!findDynamicRecord.fieldActive) {
        setIsDisabled(true)
        setShowDropDown(false)
      }  else {
        setIsDisabled(!findDynamicRecord.fieldActive)
        setShowDropDown(findDynamicRecord.fieldActive)
      }
    }
    if (findFromDropDown.label === findDynamicRecord.fieldValue) { // To update field value into selecting value properties if ever the existing field value is the same as label properties
      updateDynamicTicket(field.fieldId, findFromDropDown.value.toString(), findFromDropDown.label.toString())
    }
    if (findDynamicRecord.fieldValue !== null || findDynamicRecord.fieldValue !== '') return // guard clause to prevent useEffect from exceeding limit
    updateDynamicTicket(field.fieldId, findFromDropDown.value.toString(), findFromDropDown.label.toString())
    return () => { }
  }, [dynamicTicketForm, ticketMgmntLookUps])

  const handleChangeDropDown = (selectedLookUp: any) => {
    setSelectedLookUp(selectedLookUp)
    updateDynamicTicket(field.fieldId, selectedLookUp.value.toString(), selectedLookUp.label.toString())
    setShowDropDown(true)
  }

  const onDisplayPaymentMethod = (e: any) => {
    setLookUpText(e.currentTarget.value)
  }

  return (
    <div aria-label={`${field.fieldMappingId}-${field.fieldName}`} className={TicketFieldSizes[(fromModal || defaultSize) ? "Default" : field.fieldSizeName as keyof typeof TicketFieldSizes]}>
      <div className={`col-form-label col-sm ${requiredField && 'required'}`}   >{field.fieldName}</div>
      {showDropDown ?
        <SelectFilter
          isMulti={false}
          options={ticketMgmntLookUps}
          isRequired={field.isRequired}
          label=""
          onChange={handleChangeDropDown}
          value={selectedLookUp}
          isDisabled={isDisabled}
        /> :
        <input
          type='text'
          className='form-control form-control-sm w-100'
          style={{
            paddingTop: '0'
          }}
          onChange={onDisplayPaymentMethod}
          value={lookUpText}
          disabled={true}
        />
      }
    </div>
  )
}

export default DropdownSingleSelectionToTextDisplay